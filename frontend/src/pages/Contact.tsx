import { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

const Contact = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast.success("Message sent! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="min-h-screen bg-background py-20 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    {/* Left: Contact Information */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Get in Touch</h1>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Have questions about AutoCare AI? Our team is here to help you revolutionize your workshop management.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                    <Mail className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Email Us</h4>
                                    <p className="text-muted-foreground">support@autocare.ai</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                    <Phone className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Call Us</h4>
                                    <p className="text-muted-foreground">+91 (800) 123-4567</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                                    <MapPin className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Visit Us</h4>
                                    <p className="text-muted-foreground">123 Tech Hub, Silicon Valley, Bangalore, India</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card p-6 rounded-2xl flex items-center gap-6">
                            <div className="bg-success/10 p-4 rounded-full text-success">
                                <Clock className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-bold">Support Hours</h4>
                                <p className="text-sm text-muted-foreground">Monday - Friday: 9 AM to 6 PM IST</p>
                                <p className="text-sm text-muted-foreground">Average response time: 2 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="glass-card p-8 md:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="flex items-center gap-3 mb-8">
                            <MessageSquare className="text-primary w-6 h-6" />
                            <h2 className="text-2xl font-bold">Send a Message</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="John Doe" 
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input 
                                        id="email" 
                                        type="email" 
                                        placeholder="john@example.com" 
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input 
                                    id="subject" 
                                    placeholder="How can we help?" 
                                    value={formData.subject}
                                    onChange={e => setFormData({...formData, subject: e.target.value})}
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea 
                                    id="message" 
                                    rows={5} 
                                    placeholder="Tell us more about your workshop..." 
                                    value={formData.message}
                                    onChange={e => setFormData({...formData, message: e.target.value})}
                                    required 
                                />
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full py-6 rounded-xl font-bold text-lg gradient-primary text-primary-foreground gap-2"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
