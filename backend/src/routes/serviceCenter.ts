import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

function asJsonPatch(data: Record<string, unknown>) {
  const out: Record<string, Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    out[key] = value === null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
  }
  return out;
}

router.use(requireAuth, requireRole("service_center", "admin"));

router.get("/config", async (req: AuthenticatedRequest, res) => {
  const where = req.auth!.role === "admin"
    ? { centerId: String(req.query.centerId || req.auth!.userId) }
    : { centerId: req.auth!.userId };
  const config = await prisma.serviceCenterConfig.findUnique({ where: { centerId: where.centerId } });
  return res.json(config ?? null);
});

router.put("/config", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    featureToggles: z.unknown().optional(),
    extensionPacks: z.unknown().optional(),
    dashboardThemeConfig: z.unknown().optional(),
    branches: z.unknown().optional(),
    machineConfig: z.unknown().optional(),
    reportConfig: z.unknown().optional(),
    workshopSettings: z.unknown().optional(),
    shiftSettings: z.unknown().optional(),
    auditConfig: z.unknown().optional(),
    subscriptionStatus: z.unknown().optional(),
    mechanicShiftProfiles: z.unknown().optional(),
    recentCustomerProfiles: z.unknown().optional(),
    dashboardLayout: z.unknown().optional(),
    serviceBays: z.unknown().optional(),
    jobQueue: z.unknown().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const centerId = req.auth!.userId;
  const jsonPatch = asJsonPatch(parsed.data as Record<string, unknown>);
  const config = await prisma.serviceCenterConfig.upsert({
    where: { centerId },
    create: { centerId, ...jsonPatch },
    update: { ...jsonPatch },
  });
  return res.json(config);
});

router.get("/job-cards", async (req: AuthenticatedRequest, res) => {
  const where = req.auth!.role === "admin" ? {} : { centerId: req.auth!.userId };
  const jobs = await prisma.jobCard.findMany({ where, orderBy: { createdAt: "desc" } });
  return res.json(jobs);
});

router.get("/job-cards/:id", async (req: AuthenticatedRequest, res) => {
  const job = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
  if (!job) return res.status(404).json({ error: "Job card not found" });
  if (req.auth!.role !== "admin" && job.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  return res.json(job);
});

router.post("/job-cards", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    customerName: z.string(),
    customerPhone: z.string().optional(),
    vehicleNumber: z.string(),
    vehicleModel: z.string().optional(),
    mileage: z.number().int().optional(),
    problemDescription: z.string().optional(),
    serviceTasks: z.array(z.string()).optional(),
    partsRequired: z.array(z.string()).optional(),
    estimatedCost: z.number().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const job = await prisma.jobCard.create({
    data: {
      ...parsed.data,
      centerId: req.auth!.userId,
      serviceTasks: parsed.data.serviceTasks ?? [],
      partsRequired: parsed.data.partsRequired ?? [],
    },
  });
  return res.status(201).json(job);
});

router.patch("/job-cards/:id", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    status: z.enum(["pending", "in_progress", "waiting_parts", "completed", "delivered"]).optional(),
    actualCost: z.number().optional(),
    notes: z.string().optional(),
    mechanicId: z.string().min(1).nullable().optional(),
    mechanicName: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Job card not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const job = await prisma.jobCard.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      completedAt: parsed.data.status === "completed" || parsed.data.status === "delivered" ? new Date() : undefined,
    },
  });

  return res.json(job);
});

router.delete("/job-cards/:id", async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.jobCard.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Job card not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  await prisma.jobCard.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

router.get("/customers", async (req: AuthenticatedRequest, res) => {
  const where = req.auth!.role === "admin" ? {} : { centerId: req.auth!.userId };
  const customers = await prisma.customer.findMany({ where, orderBy: { lastVisit: "desc" } });
  return res.json(customers);
});

router.post("/customers", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    vehicleNumbers: z.array(z.string()).optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const customer = await prisma.customer.create({
    data: {
      ...parsed.data,
      centerId: req.auth!.userId,
      vehicleNumbers: parsed.data.vehicleNumbers ?? [],
    },
  });

  return res.status(201).json(customer);
});

router.patch("/customers/:id", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().nullable().optional(),
    vehicleNumbers: z.array(z.string()).optional(),
    totalVisits: z.number().int().optional(),
    totalSpend: z.number().optional(),
    lastVisit: z.string().datetime().nullable().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Customer not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      lastVisit: parsed.data.lastVisit === undefined ? undefined : (parsed.data.lastVisit ? new Date(parsed.data.lastVisit) : null),
    },
  });
  return res.json(customer);
});

router.delete("/customers/:id", async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Customer not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  await prisma.customer.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

router.get("/mechanics", async (req: AuthenticatedRequest, res) => {
  const where = req.auth!.role === "admin" ? {} : { centerId: req.auth!.userId };
  const mechanics = await prisma.mechanic.findMany({ where, orderBy: { name: "asc" } });
  return res.json(mechanics);
});

router.post("/mechanics", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string(),
    phone: z.string().optional(),
    specialization: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const mechanic = await prisma.mechanic.create({
    data: {
      ...parsed.data,
      centerId: req.auth!.userId,
    },
  });

  return res.status(201).json(mechanic);
});

router.patch("/mechanics/:id", async (req: AuthenticatedRequest, res) => {
  const schema = z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    specialization: z.string().optional(),
    status: z.enum(["available", "busy", "off_duty"]).optional(),
    activeJobs: z.number().int().optional(),
    completedJobs: z.number().int().optional(),
    rating: z.number().optional(),
  });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.mechanic.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Mechanic not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const mechanic = await prisma.mechanic.update({
    where: { id: req.params.id },
    data: parsed.data,
  });
  return res.json(mechanic);
});

router.delete("/mechanics/:id", async (req: AuthenticatedRequest, res) => {
  const existing = await prisma.mechanic.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Mechanic not found" });
  if (req.auth!.role !== "admin" && existing.centerId !== req.auth!.userId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  await prisma.mechanic.delete({ where: { id: req.params.id } });
  return res.status(204).send();
});

export default router;
