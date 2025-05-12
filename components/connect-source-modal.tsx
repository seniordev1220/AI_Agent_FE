import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { Label } from "./ui/label"
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react"

interface ConnectSourceModalProps {
  isOpen: boolean
  onClose: () => void
  selectedSource: string | null
}

interface SourceField {
  key: string
  label: string
  type: string
  required?: boolean
  multiple?: boolean
  accept?: string
  placeholder?: string
}

interface ValidationError {
  field: string;
  message: string;
}

export function ConnectSourceModal({ isOpen, onClose, selectedSource }: ConnectSourceModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success'>('idle');

  const getSourceFields = (): SourceField[] => {
    switch (selectedSource) {
      case 'Airtable':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password' },
          { key: 'baseId', label: 'Base ID', type: 'text' },
        ];
      case 'Dropbox':
        return [
          { key: 'accessToken', label: 'Access Token', type: 'password' },
          { key: 'appKey', label: 'App Key', type: 'password' },
          { key: 'appSecret', label: 'App Secret', type: 'password' },
        ];
      case 'Google Drive':
        return [
          { key: 'oauthCredentials', label: 'OAuth Credentials', type: 'file' },
          { key: 'serviceAccount', label: 'Service Account Key (Optional)', type: 'file' },
        ];
      case 'Slack':
        return [
          { key: 'oauthToken', label: 'OAuth Token', type: 'password' },
          { key: 'botToken', label: 'Bot Token (Optional)', type: 'password' },
        ];
      case 'Upload Files':
        return [
          { key: 'files', label: 'Select Files (max 20MB per file)', type: 'file', multiple: true },
        ];
      case 'GitHub':
        return [
          { key: 'personalAccessToken', label: 'Personal Access Token', type: 'password' },
          { key: 'oauthToken', label: 'OAuth Token (Alternative)', type: 'password', required: false },
        ];
      case 'One Drive':
        return [
          { key: 'oauthCredentials', label: 'OAuth Credentials', type: 'file' },
          { key: 'clientId', label: 'Client ID', type: 'text' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password' },
        ];
      case 'Sharepoint':
        return [
          { key: 'oauthCredentials', label: 'OAuth Credentials', type: 'file' },
          { key: 'siteUrl', label: 'Site URL', type: 'url' },
          { key: 'tenantId', label: 'Tenant ID', type: 'text' },
        ];
      case 'Web Scraper':
        return [
          { key: 'urls', label: 'URLs (one per line)', type: 'textarea' },
          { key: 'scrapingRules', label: 'Scraping Rules (JSON)', type: 'textarea' },
          { key: 'apiKey', label: 'API Key (if applicable)', type: 'password', required: false },
        ];
      case 'Snowflake':
        return [
          { key: 'accountName', label: 'Account Name', type: 'text' },
          { key: 'username', label: 'Username', type: 'text' },
          { key: 'password', label: 'Password', type: 'password' },
          { key: 'warehouse', label: 'Warehouse', type: 'text' },
          { key: 'database', label: 'Database', type: 'text' },
          { key: 'schema', label: 'Schema', type: 'text' },
        ];
      case 'Salesforce':
        return [
          { key: 'oauthCredentials', label: 'OAuth Credentials', type: 'file' },
          { key: 'clientId', label: 'Client ID', type: 'text' },
          { key: 'clientSecret', label: 'Client Secret', type: 'password' },
          { key: 'instanceUrl', label: 'Instance URL', type: 'url', 
            placeholder: 'https://your-instance.salesforce.com' },
        ];
      case 'Hubspot':
        return [
          { key: 'apiKey', label: 'API Key', type: 'password' },
          { key: 'oauthToken', label: 'OAuth Token (Alternative)', type: 'password', required: false },
        ];
      default:
        return [];
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];
    const fields = getSourceFields();

    switch (selectedSource) {
      case 'Airtable':
        if (!formData.apiKey?.match(/^pat[a-zA-Z0-9]{14,}$/)) {
          newErrors.push({ field: 'apiKey', message: 'Invalid API key format' });
        }
        if (!formData.baseId?.match(/^app[a-zA-Z0-9]{14}$/)) {
          newErrors.push({ field: 'baseId', message: 'Invalid Base ID format' });
        }
        break;

      case 'Dropbox':
        if (!formData.accessToken?.startsWith('sl.')) {
          newErrors.push({ field: 'accessToken', message: 'Invalid access token format' });
        }
        if (formData.appKey?.length < 15) {
          newErrors.push({ field: 'appKey', message: 'App key must be at least 15 characters' });
        }
        break;

      case 'GitHub':
        if (!formData.personalAccessToken?.match(/^ghp_[a-zA-Z0-9]{36}$/)) {
          newErrors.push({ field: 'personalAccessToken', message: 'Invalid personal access token format' });
        }
        break;

      case 'Snowflake':
        if (!formData.accountName) {
          newErrors.push({ field: 'accountName', message: 'Account name is required' });
        }
        if (!formData.username) {
          newErrors.push({ field: 'username', message: 'Username is required' });
        }
        if (!formData.warehouse) {
          newErrors.push({ field: 'warehouse', message: 'Warehouse is required' });
        }
        break;

      case 'Web Scraper':
        try {
          if (formData.scrapingRules) {
            JSON.parse(formData.scrapingRules);
          }
        } catch {
          newErrors.push({ field: 'scrapingRules', message: 'Invalid JSON format' });
        }
        if (formData.urls) {
          const urlList = formData.urls.split('\n');
          urlList.forEach((url: string, index: number) => {
            try {
              new URL(url.trim());
            } catch {
              newErrors.push({ field: 'urls', message: `Invalid URL on line ${index + 1}` });
            }
          });
        }
        break;

      case 'Salesforce':
        if (!formData.instanceUrl?.match(/^https:\/\/[a-zA-Z0-9-]+\.salesforce\.com$/)) {
          newErrors.push({ field: 'instanceUrl', message: 'Invalid Salesforce instance URL' });
        }
        if (!formData.clientId || formData.clientId.length < 10) {
          newErrors.push({ field: 'clientId', message: 'Invalid client ID' });
        }
        break;

      case 'Upload Files':
        const files = formData.files as File[];
        if (files?.some(file => file.size > 20 * 1024 * 1024)) {
          newErrors.push({ field: 'files', message: 'One or more files exceed 20MB limit' });
        }
        break;

      case 'Sharepoint':
        try {
          new URL(formData.siteUrl);
        } catch {
          newErrors.push({ field: 'siteUrl', message: 'Invalid SharePoint site URL' });
        }
        if (!formData.tenantId?.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
          newErrors.push({ field: 'tenantId', message: 'Invalid tenant ID format' });
        }
        break;
    }

    // General validation for required fields
    fields.forEach(field => {
      if (field.required !== false && !formData[field.key]) {
        newErrors.push({ field: field.key, message: `${field.label} is required` });
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Calculate total size for uploaded files
        let totalSize = "0 MB";
        if (selectedSource === "Upload Files" && formData.files) {
          const files = formData.files as File[];
          const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
          
          // Convert bytes to appropriate unit
          if (totalBytes < 1024 * 1024) {
            totalSize = `${(totalBytes / 1024).toFixed(1)} KB`;
          } else if (totalBytes < 1024 * 1024 * 1024) {
            totalSize = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
          } else {
            totalSize = `${(totalBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
          }
        }

        // Get user name from browser or system
        const owner = localStorage.getItem('userName') || 
                     (typeof window !== 'undefined' && window.navigator?.userAgent.includes('Windows') ? 
                     'Windows User' : 'Current User');

        // Add new source to localStorage with ISO timestamp
        const existingSources = JSON.parse(localStorage.getItem('dataSources') || '[]');
        const newSource = {
          id: Date.now().toString(),
          icon: selectedSource === "Upload Files" ? 
                "/data_icon/file-icon.svg" : 
                `/data_icon/${selectedSource?.toLowerCase().replace(' ', '-')}.svg`,
          name: selectedSource === "Upload Files" ? 
                (formData.files?.[0]?.name || "Uploaded Files") :
                selectedSource,
          status: "Verified" as const,
          size: totalSize,
          owner: "Current User",
          lastSync: new Date().toISOString() // Store as ISO string
        };
        
        localStorage.setItem('dataSources', JSON.stringify([...existingSources, newSource]));
        
        // Dispatch a custom event to notify DataTable
        window.dispatchEvent(new Event('sourceAdded'));
        
        onClose();
      } catch (error) {
        setErrors([{ field: 'general', message: 'Connection failed. Please try again.' }]);
      }
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = async (key: string, files: File[]) => {
    setUploadStatus('uploading');
    
    // Simulate file upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setFormData(prev => ({ ...prev, [key]: files }));
    setUploadStatus('success');
  };

  const getFieldError = (fieldKey: string) => {
    return errors.find(error => error.field === fieldKey)?.message;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to {selectedSource}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {getSourceFields().map(field => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={field.key}>{field.label}</Label>
              {field.type === 'textarea' ? (
                <textarea
                  id={field.key}
                  className={`w-full min-h-[100px] px-3 py-2 border rounded-md ${
                    getFieldError(field.key) ? 'border-red-500' : ''
                  }`}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  required={field.required !== false}
                  placeholder={field.placeholder}
                />
              ) : field.type === 'file' ? (
                <div className="relative">
                  <Input
                    id={field.key}
                    type="file"
                    multiple={field.multiple}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleFileChange(field.key, files);
                    }}
                    required={field.required !== false}
                    accept={field.accept}
                    className={getFieldError(field.key) ? 'border-red-500' : ''}
                  />
                  {uploadStatus === 'uploading' && (
                    <RefreshCw className="h-4 w-4 text-blue-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                  {uploadStatus === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              ) : (
                <Input
                  id={field.key}
                  type={field.type}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  required={field.required !== false}
                  placeholder={field.placeholder}
                  className={getFieldError(field.key) ? 'border-red-500' : ''}
                />
              )}
              {getFieldError(field.key) && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{getFieldError(field.key)}</span>
                </div>
              )}
            </div>
          ))}
          {getFieldError('general') && (
            <div className="text-red-500 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>{getFieldError('general')}</span>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Connect</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 