import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin } from 'lucide-react';
import emailjs from '@emailjs/browser';

// Initialize EmailJS with your public key
emailjs.init("sP7fucUk2AIxCWqex");

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || user.email || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Limit message length
    if (name === 'message' && value.length > 1000) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields: (keyof typeof formData)[] = ['name', 'email', 'subject', 'message'];
    const missingField = requiredFields.find(field => !formData[field].trim());
    
    if (missingField) {
      toast({
        title: "Missing Information",
        description: `Please fill in the ${missingField} field.`,
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        to_name: "Admin",
        reply_to: formData.email
      };

      // Send email using EmailJS
      const result = await emailjs.send(
        'service_6duvksn',   
        'template_6xhouuq',  
        templateParams
      );

      // Optional: Send auto-reply confirmation to user
      const autoReplyParams = {
        to_email: formData.email,
        to_name: formData.name,
        subject: `Re: ${formData.subject}`,
        message: `We've received your message: "${formData.message.substring(0, 50)}..."`
      };

      try {
        await emailjs.send(
          'service_6duvksn',           
          'template_jmgi5wj', // Replace with your actual auto-reply template ID
          autoReplyParams
        );
      } catch (autoReplyError) {
        console.log("Auto-reply failed:", autoReplyError);
      }

      if (result.status === 200) {
        toast({
          title: "Message Sent Successfully! ✅",
          description: "Your message has been sent to the admin. You should receive a confirmation email shortly.",
        });
        
        // Reset form but keep user info
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error: any) {
      console.error("Failed to send email:", error);
      toast({
        title: "Error",
        description: error.text || "Failed to send message. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg p-6">
        <h2 className="text-3xl font-bold mb-2">Contact Admin</h2>
        <p className="text-primary-foreground/90">
          Get in touch with our support team for assistance with your farm management needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you within 24 hours. You'll receive a confirmation email once your message is sent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                    className="focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="What can we help you with?"
                  required
                  className="focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please describe your question or issue in detail..."
                  rows={6}
                  required
                  className="focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.message.length}/1000 characters
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || 
                  !formData.name.trim() || 
                  !formData.email.trim() || 
                  !formData.subject.trim() || 
                  !formData.message.trim()} 
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending Message...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Other ways to reach our support team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">kingluciferinhell@gmail.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    Farm Street<br />
                    Agriculture City<br/>
                    India
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Support Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;