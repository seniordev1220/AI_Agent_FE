import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { Label } from "./ui/label"
import { AlertCircle, RefreshCw, CheckCircle } from "lucide-react"
import { useSession } from "next-auth/react"

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
  const { data: session } = useSession();

  const getSourceFields = (): SourceField[] => {
    switch (selectedSource) {
      case 'Airtable':
        return [
          { key: 'api_key', label: 'API Key', type: 'password' },
          { key: 'base_id', label: 'Base ID', type: 'text' },
          { key: 'table_name', label: 'Table Name', type: 'text' },
        ];
      case 'Dropbox':
        return [
          { key: 'access_token', label: 'Access Token', type: 'password' },
          { key: 'folder_path', label: 'Folder Path', type: 'text', 
            placeholder: '/path/to/folder' },
          { key: 'recursive', label: 'Include Subfolders', type: 'checkbox' },
        ];
      case 'Google Drive':
        return [
          { key: 'type', label: 'Service Account Type', type: 'text' },
          { key: 'project_id', label: 'Project ID', type: 'text' },
          { key: 'private_key_id', label: 'Private Key ID', type: 'password' },
          { key: 'private_key', label: 'Private Key', type: 'textarea' },
          { key: 'client_email', label: 'Client Email', type: 'email' },
          { key: 'client_id', label: 'Client ID', type: 'text' },
        ];
      case 'Slack':
        return [
          { key: 'bot_token', label: 'Bot Token', type: 'password' },
          { key: 'channel_ids', label: 'Channel IDs (comma-separated)', type: 'text',
            placeholder: 'C1234567890,C0987654321' },
          { key: 'oldest_date', label: 'Fetch Messages From', type: 'date' },
        ];
      case 'GitHub':
        return [
          { key: 'access_token', label: 'Access Token', type: 'password' },
          { key: 'repository', label: 'Repository', type: 'text',
            placeholder: 'owner/repo-name' },
          { key: 'branch', label: 'Branch', type: 'text',
            placeholder: 'main' },
          { key: 'file_types', label: 'File Types (comma-separated)', type: 'text',
            placeholder: '.py,.js,.md' },
        ];
      case 'One Drive':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' },
          { key: 'tenant_id', label: 'Tenant ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/Documents/Folder' },
        ];
      case 'Sharepoint':
        return [
          { key: 'client_id', label: 'Client ID', type: 'text' },
          { key: 'client_secret', label: 'Client Secret', type: 'password' },
          { key: 'site_url', label: 'Site URL', type: 'url' },
          { key: 'tenant_id', label: 'Tenant ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/sites/your-site/Shared Documents' },
        ];
      case 'Web Scraper':
        return [
          { key: 'urls', label: 'URLs (one per line)', type: 'textarea',
            placeholder: 'https://example.com/page1\nhttps://example.com/page2' },
          { key: 'css_selectors', label: 'CSS Selectors (JSON)', type: 'textarea',
            placeholder: '{\n  "content": "article.main-content",\n  "title": "h1.title"\n}' },
          { key: 'max_depth', label: 'Max Depth', type: 'number',
            placeholder: '2', required: false },
          { key: 'follow_links', label: 'Follow Links', type: 'checkbox' },
        ];
      case 'Snowflake':
        return [
          { key: 'account', label: 'Account', type: 'text' },
          { key: 'username', label: 'Username', type: 'text' },
          { key: 'password', label: 'Password', type: 'password' },
          { key: 'warehouse', label: 'Warehouse', type: 'text' },
          { key: 'database', label: 'Database', type: 'text' },
          { key: 'schema', label: 'Schema', type: 'text' },
          { key: 'query', label: 'Query', type: 'textarea',
            placeholder: 'SELECT * FROM your_table' },
        ];
      case 'Salesforce':
        return [
          { key: 'username', label: 'Username', type: 'text' },
          { key: 'password', label: 'Password', type: 'password' },
          { key: 'security_token', label: 'Security Token', type: 'password' },
          { key: 'domain', label: 'Domain', type: 'text',
            placeholder: 'login.salesforce.com' },
          { key: 'objects', label: 'Objects (comma-separated)', type: 'text',
            placeholder: 'Account,Contact,Opportunity' },
        ];
      case 'Hubspot':
        return [
          { key: 'api_key', label: 'API Key', type: 'password' },
          { key: 'objects', label: 'Objects (comma-separated)', type: 'text',
            placeholder: 'contacts,companies,deals' },
          { key: 'properties', label: 'Properties (comma-separated)', type: 'text',
            placeholder: 'email,firstname,lastname' },
          { key: 'limit', label: 'Limit', type: 'number',
            placeholder: '1000', required: false },
        ];
      case 'Upload Files':
        return [
          { 
            key: 'files', 
            label: 'Select Files', 
            type: 'file',
            multiple: true,
            accept: '.pdf,.doc,.docx,.txt,.md,.csv',
            required: true 
          }
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
        if (!formData.api_key?.match(/^pat[a-zA-Z0-9]{14,}$/)) {
          newErrors.push({ field: 'api_key', message: 'Invalid API key format' });
        }
        if (!formData.base_id?.match(/^app[a-zA-Z0-9]{14}$/)) {
          newErrors.push({ field: 'base_id', message: 'Invalid Base ID format' });
        }
        break;

      case 'Dropbox':
        if (!formData.access_token?.startsWith('sl.')) {
          newErrors.push({ field: 'access_token', message: 'Invalid access token format' });
        }
        if (formData.folder_path?.length < 15) {
          newErrors.push({ field: 'folder_path', message: 'Folder path must be at least 15 characters' });
        }
        break;

      case 'GitHub':
        if (!formData.access_token?.match(/^ghp_[a-zA-Z0-9]{36}$/)) {
          newErrors.push({ field: 'access_token', message: 'Invalid access token format' });
        }
        break;

      case 'Snowflake':
        if (!formData.account) {
          newErrors.push({ field: 'account', message: 'Account is required' });
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
          if (formData.css_selectors) {
            JSON.parse(formData.css_selectors);
          }
        } catch {
          newErrors.push({ field: 'css_selectors', message: 'Invalid JSON format' });
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
        if (!formData.domain?.match(/^https:\/\/[a-zA-Z0-9-]+\.salesforce\.com$/)) {
          newErrors.push({ field: 'domain', message: 'Invalid Salesforce domain' });
        }
        if (!formData.client_id || formData.client_id.length < 10) {
          newErrors.push({ field: 'client_id', message: 'Invalid client ID' });
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
          new URL(formData.site_url);
        } catch {
          newErrors.push({ field: 'site_url', message: 'Invalid SharePoint site URL' });
        }
        if (!formData.tenant_id?.match(/^[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}$/)) {
          newErrors.push({ field: 'tenant_id', message: 'Invalid tenant ID format' });
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
      setUploadStatus('uploading');

      try {
        if (selectedSource === 'Upload Files') {
          // Handle file uploads one at a time
          const files = formData.files as File[];
          const uploadedSources = [];

          for (const file of files) {
            const fileFormData = new FormData();
            fileFormData.append('file', file);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge_base/upload`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${session?.user?.accessToken}`
              },
              body: fileFormData
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.detail || `Failed to upload file: ${file.name}`);
            }

            const result = await response.json();
            uploadedSources.push(result);
          }

          setUploadStatus('success');
          window.dispatchEvent(new Event('sourceAdded'));
          
          // Close modal after short delay to show success state
          setTimeout(() => {
            onClose();
          }, 1000);
          
          return;
        }

        // Handle other data sources...
        const dataSourcePayload = {
          name: selectedSource ?? '',
          source_type: (selectedSource ?? '').toLowerCase().replace(' ', '_'),
          connection_settings: {}
        };

        // Process form data based on source type
        switch (selectedSource) {
          case 'Airtable':
          case 'Hubspot':
            dataSourcePayload.connection_settings = formData;
            break;
          
          case 'Dropbox':
          case 'GitHub':
          case 'One Drive':
          case 'Sharepoint':
            dataSourcePayload.connection_settings = {
              ...formData,
              // Convert folder_path to proper format if exists
              folder_path: formData.folder_path?.startsWith('/') 
                ? formData.folder_path 
                : `/${formData.folder_path}`
            };
            break;

          case 'Slack':
            dataSourcePayload.connection_settings = {
              ...formData,
              // Convert comma-separated channel_ids to array
              channel_ids: formData.channel_ids?.split(',').map((id: string) => id.trim())
            };
            break;

          case 'Web Scraper':
            dataSourcePayload.connection_settings = {
              urls: formData.urls?.split('\n').map((url: string) => url.trim()),
              css_selectors: JSON.parse(formData.css_selectors || '{}'),
              max_depth: parseInt(formData.max_depth) || 2,
              follow_links: Boolean(formData.follow_links)
            };
            break;

          case 'Salesforce':
          case 'Hubspot':
            dataSourcePayload.connection_settings = {
              ...formData,
              // Convert comma-separated lists to arrays
              objects: formData.objects?.split(',').map((obj: string) => obj.trim()),
              properties: formData.properties?.split(',').map((prop: string) => prop.trim())
            };
            break;

          default:
            dataSourcePayload.connection_settings = formData;
        }

        // Make API request to create data source
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge_base`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.user?.accessToken}`
          },
          body: JSON.stringify(dataSourcePayload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to connect data source');
        }

        setUploadStatus('success');
        
        // Dispatch custom event to refresh data sources list
        window.dispatchEvent(new Event('sourceAdded'));
        
        // Close modal after short delay to show success state
        setTimeout(() => {
          onClose();
        }, 1000);

      } catch (error) {
        console.error('Error connecting data source:', error);
        setErrors([{ 
          field: 'general', 
          message: error instanceof Error ? error.message : 'An error occurred while connecting the data source'
        }]);
        setUploadStatus('idle');
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