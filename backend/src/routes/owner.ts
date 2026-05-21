import { Router } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs";
import multer from "multer";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const authReq = req as AuthenticatedRequest;
    cb(null, `${authReq.auth?.userId ?? "user"}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(requireAuth, requireRole("owner", "admin"));

router.post("/upload-bill", upload.single("bill"), async (req: AuthenticatedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const billUrl = `${baseUrl}/uploads/${req.file.filename}`;
  return res.status(201).json({ billUrl });
});

router.get("/vehicles", async (req: AuthenticatedRequest, res) => {
  const where = req.auth!.role === "admin" ? {} : { ownerId: req.auth!.userId };
  const vehicles = await prisma.vehicle.findMany({ where, orderBy: { createdAt: "desc" } });
  return res.json(vehicles);
});

router.get("/vehicles/:id", async (req: AuthenticatedRequest, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (req.auth!.role !== "admin" && vehicle.ownerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(vehicle);
});

router.post("/vehicles", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string(),
    vehicleNumber: z.string(),
    type: z.enum(["bike", "car", "truck", "bus", "scooter", "machinery"]).default("car"),
    manufacturer: z.string().default(""),
    model: z.string().default(""),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const vehicle = await prisma.vehicle.create({
    data: {
      ...parsed.data,
      ownerId: req.auth!.userId,
    },
  });
  return res.status(201).json(vehicle);
});

router.patch("/vehicles/:id", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string().optional(),
    vehicleNumber: z.string().optional(),
    type: z.enum(["bike", "car", "truck", "bus", "scooter", "machinery"]).optional(),
    manufacturer: z.string().optional(),
    model: z.string().optional(),
    year: z.number().int().optional(),
    fuelType: z.enum(["petrol", "diesel", "electric", "hybrid", "cng", "lpg"]).optional(),
    currentMileage: z.number().int().optional(),
    nextServiceDate: z.string().datetime().nullable().optional(),
    insuranceExpiry: z.string().datetime().nullable().optional(),
    pucExpiry: z.string().datetime().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (req.auth!.role !== "admin" && vehicle.ownerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.vehicle.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      nextServiceDate: parsed.data.nextServiceDate === undefined ? undefined : (parsed.data.nextServiceDate ? new Date(parsed.data.nextServiceDate) : null),
      insuranceExpiry: parsed.data.insuranceExpiry === undefined ? undefined : (parsed.data.insuranceExpiry ? new Date(parsed.data.insuranceExpiry) : null),
      pucExpiry: parsed.data.pucExpiry === undefined ? undefined : (parsed.data.pucExpiry ? new Date(parsed.data.pucExpiry) : null),
    },
  });
  return res.json(updated);
});

router.delete("/vehicles/:id", async (req: AuthenticatedRequest, res) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id } });
  if (!vehicle) return res.status(404).json({ error: "Vehicle not found" });
  if (req.auth!.role !== "admin" && vehicle.ownerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.vehicle.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

router.get("/service-records", async (req: AuthenticatedRequest, res) => {
  const vehicleId = typeof req.query.vehicleId === "string" ? req.query.vehicleId : undefined;
  const records = await prisma.serviceRecord.findMany({
    where: {
      ownerId: req.auth!.role === "admin" ? undefined : req.auth!.userId,
      vehicleId,
    },
    orderBy: { date: "desc" },
  });
  return res.json(records);
});

router.post("/service-records", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    vehicleId: z.string().min(1),
    serviceType: z.enum(["oil_change", "brake_pad", "wheel_alignment", "wheel_balancing", "tire_replacement", "battery_replacement", "general_service", "engine_repair", "custom"]),
    date: z.string().datetime().optional(),
    mileageAtService: z.number().int().optional(),
    serviceCenterName: z.string().optional(),
    mechanicName: z.string().optional(),
    partsReplaced: z.array(z.string()).optional(),
    cost: z.number().optional(),
    notes: z.string().optional(),
    billUrl: z.string().url().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const record = await prisma.serviceRecord.create({
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
      ownerId: req.auth!.userId,
    },
  });

  return res.status(201).json(record);
});

router.patch("/service-records/:id", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    serviceType: z.enum(["oil_change", "brake_pad", "wheel_alignment", "wheel_balancing", "tire_replacement", "battery_replacement", "general_service", "engine_repair", "custom"]).optional(),
    date: z.string().datetime().optional(),
    mileageAtService: z.number().int().optional(),
    serviceCenterName: z.string().optional(),
    mechanicName: z.string().optional(),
    partsReplaced: z.array(z.string()).optional(),
    cost: z.number().optional(),
    notes: z.string().optional(),
    billUrl: z.string().url().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.serviceRecord.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Service record not found" });
  if (req.auth!.role !== "admin" && existing.ownerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const updated = await prisma.serviceRecord.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    },
  });
  return res.json(updated);
});

router.delete("/service-records/:id", async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.serviceRecord.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Service record not found" });
  if (req.auth!.role !== "admin" && existing.ownerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  await prisma.serviceRecord.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
