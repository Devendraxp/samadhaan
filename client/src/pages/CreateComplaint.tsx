import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api, createFormData } from "@/lib/api";
import { toast } from "sonner";
import { DOMAIN_LABELS, STAFF_DOMAINS } from "@/lib/constants";
import type { Domain } from "@/lib/types";

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    domain: "" as Domain | "",
    anonymous: false,
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.domain) {
      toast.error("Please select a domain");
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        subject: formData.subject,
        description: formData.description,
        domain: formData.domain,
        anonymous: formData.anonymous,
      };

      if (file) {
        data.file = file;
      }

      const response = await api.post("/complaint", createFormData(data), {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      toast.success("Complaint submitted successfully!");
      navigate(`/complaint/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-12">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Submit a Complaint</CardTitle>
            <CardDescription>
              Describe your issue and we'll get it resolved as soon as possible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of the issue"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value: Domain) => setFormData({ ...formData, domain: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_DOMAINS.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {DOMAIN_LABELS[domain]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  disabled={loading}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attachment (Optional)</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Upload an image to help illustrate the issue
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="anonymous">Submit Anonymously</Label>
                  <p className="text-sm text-muted-foreground">
                    Your identity will be hidden from other users
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => setFormData({ ...formData, anonymous: checked })}
                  disabled={loading}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Complaint"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/complaints")}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
