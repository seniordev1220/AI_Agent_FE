import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useState } from "react"
import { Label } from "./ui/label"
import { AlertCircle, RefreshCw, CheckCircle, Check } from "lucide-react"
import { useSession } from "next-auth/react"
import { Checkbox } from "./ui/checkbox"

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
    const commonFields: SourceField[] = [
      { 
        key: 'source_name', 
        label: 'Data Source Name', 
        type: 'text', 
        required: true,
        placeholder: `My ${selectedSource} Connection`
      }
    ];

    switch (selectedSource) {
      case 'Airtable':
        return [
          ...commonFields,
          { key: 'api_token', label: 'API Token', type: 'password', required: true },
          { key: 'base_id', label: 'Base ID', type: 'text', required: true },
          { key: 'table_id', label: 'Table ID', type: 'text', required: true },
        ];
      case 'Dropbox':
        return [
          ...commonFields,
          { key: 'dropbox_access_token', label: 'Access Token', type: 'password', required: true },
          { key: 'dropbox_folder_path', label: 'Folder Path', type: 'text', 
            placeholder: '/path/to/folder' },
          { key: 'dropbox_file_paths', label: 'File Paths (one per line)', type: 'textarea',
            placeholder: '/path/to/file1.txt\n/path/to/file2.pdf' },
          { key: 'recursive', label: 'Include Subfolders', type: 'checkbox' },
        ];
      case 'Google Drive':
        return [
          ...commonFields,
          { key: 'folder_id', label: 'Folder ID', type: 'text', 
            placeholder: 'Google Drive Folder ID' },
          { key: 'service_account_key', label: 'Service Account Key (JSON)', type: 'textarea',
            required: true },
          { key: 'token_path', label: 'Token Path', type: 'text',
            placeholder: '/path/to/token.json' },
          { key: 'recursive', label: 'Load Recursively', type: 'checkbox' },
          { key: 'load_trashed_files', label: 'Load Trashed Files', type: 'checkbox' },
        ];
      case 'Slack':
        return [
          ...commonFields,
          { key: 'zip_path', label: 'Slack Export ZIP Path', type: 'text', required: true,
            placeholder: '/path/to/slack-export.zip' },
          { key: 'workspace_url', label: 'Workspace URL', type: 'url',
            placeholder: 'https://your-workspace.slack.com' },
        ];
      case 'One Drive':
        return [
          ...commonFields,
          { key: 'client_id', label: 'Client ID', type: 'text', required: true },
          { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
          { key: 'drive_id', label: 'Drive ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/Documents/Folder' },
          { key: 'recursive', label: 'Load Recursively', type: 'checkbox' },
        ];
      case 'Sharepoint':
        return [
          ...commonFields,
          { key: 'tenant_name', label: 'Tenant Name', type: 'text', required: true },
          { key: 'collection_id', label: 'Collection ID', type: 'text', required: true },
          { key: 'subsite_id', label: 'Subsite ID', type: 'text', required: true },
          { key: 'document_library_id', label: 'Document Library ID', type: 'text' },
          { key: 'folder_path', label: 'Folder Path', type: 'text',
            placeholder: '/sites/your-site/Shared Documents' },
        ];
      case 'GitHub':
        return [
          ...commonFields,
          { key: 'access_token', label: 'GitHub Access Token', type: 'password', required: true,
            placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
          { key: 'repo', label: 'Repository', type: 'text', required: true,
            placeholder: 'owner/repo-name' },
          { key: 'branch', label: 'Branch', type: 'text',
            placeholder: 'main' },
          { key: 'file_extensions', label: 'File Extensions (comma-separated)', type: 'text',
            placeholder: '.py,.js,.md',
            required: true },
          { key: 'github_api_url', label: 'GitHub API URL', type: 'text',
            placeholder: 'https://api.github.com' },
        ];
      case 'Web Scraper':
        return [
          ...commonFields,
          { key: 'urls', label: 'URLs (one per line)', type: 'textarea', required: true,
            placeholder: 'https://example.com/page1\nhttps://example.com/page2' },
          { key: 'requests_per_second', label: 'Requests per Second', type: 'number',
            placeholder: '2' },
          { key: 'browser_session_options', label: 'Browser Session Options (JSON)', type: 'textarea',
            placeholder: '{\n  "headers": {\n    "User-Agent": "Mozilla/5.0..."\n  }\n}' },
        ];
      case 'Snowflake':
        return [
          ...commonFields,
          { key: 'query', label: 'Query', type: 'textarea', required: true,
            placeholder: 'SELECT * FROM your_table' },
          { key: 'user', label: 'Username', type: 'text', required: true },
          { key: 'password', label: 'Password', type: 'password', required: true },
          { key: 'account', label: 'Account', type: 'text', required: true },
          { key: 'warehouse', label: 'Warehouse', type: 'text', required: true },
          { key: 'role', label: 'Role', type: 'text', required: true },
          { key: 'database', label: 'Database', type: 'text', required: true },
          { key: 'schema', label: 'Schema', type: 'text', required: true },
        ];
      case 'Upload Files':
        return [
          ...commonFields,
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

    if (!formData.source_name?.trim()) {
      newErrors.push({ field: 'source_name', message: 'Data Source Name is required' });
    }

    switch (selectedSource) {
      case 'Airtable':
        if (!formData.api_token?.match(/^pat[a-zA-Z0-9]{14,}$/)) {
          newErrors.push({ field: 'api_token', message: 'Invalid API token format' });
        }
        if (!formData.base_id?.match(/^app[a-zA-Z0-9]{14}$/)) {
          newErrors.push({ field: 'base_id', message: 'Invalid Base ID format' });
        }
        if (!formData.table_id) {
          newErrors.push({ field: 'table_id', message: 'Table ID is required' });
        }
        break;

      case 'Dropbox':
        if (!formData.dropbox_access_token?.startsWith('sl.')) {
          newErrors.push({ field: 'dropbox_access_token', message: 'Invalid access token format' });
        }
        if (!formData.dropbox_folder_path && !formData.dropbox_file_paths) {
          newErrors.push({ field: 'dropbox_folder_path', message: 'Either folder path or file paths must be provided' });
        }
        break;

      case 'Google Drive':
        try {
          if (formData.service_account_key) {
            JSON.parse(formData.service_account_key);
          } else {
            newErrors.push({ field: 'service_account_key', message: 'Service account key is required' });
          }
        } catch {
          newErrors.push({ field: 'service_account_key', message: 'Invalid JSON format for service account key' });
        }
        break;

      case 'Slack':
        if (!formData.zip_path) {
          newErrors.push({ field: 'zip_path', message: 'ZIP path is required' });
        }
        if (formData.workspace_url && !formData.workspace_url.match(/^https:\/\/[a-zA-Z0-9-]+\.slack\.com$/)) {
          newErrors.push({ field: 'workspace_url', message: 'Invalid Slack workspace URL' });
        }
        break;

      case 'Sharepoint':
        if (!formData.tenant_name) {
          newErrors.push({ field: 'tenant_name', message: 'Tenant name is required' });
        }
        if (!formData.collection_id) {
          newErrors.push({ field: 'collection_id', message: 'Collection ID is required' });
        }
        if (!formData.subsite_id) {
          newErrors.push({ field: 'subsite_id', message: 'Subsite ID is required' });
        }
        break;

      case 'GitHub':
        if (!formData.access_token?.match(/^ghp_[a-zA-Z0-9]{36}$/)) {
          newErrors.push({ field: 'access_token', message: 'Invalid GitHub access token format' });
        }
        if (!formData.repo?.match(/^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/)) {
          newErrors.push({ field: 'repo', message: 'Invalid repository format. Should be owner/repo-name' });
        }
        break;

      case 'Web Scraper':
        if (formData.urls) {
          const urlList = formData.urls.split('\n');
          urlList.forEach((url: string, index: number) => {
            try {
              new URL(url.trim());
            } catch {
              newErrors.push({ field: 'urls', message: `Invalid URL on line ${index + 1}` });
            }
          });
        } else {
          newErrors.push({ field: 'urls', message: 'At least one URL is required' });
        }
        if (formData.browser_session_options) {
          try {
            JSON.parse(formData.browser_session_options);
          } catch {
            newErrors.push({ field: 'browser_session_options', message: 'Invalid JSON format' });
          }
        }
        break;

      case 'Snowflake':
        const requiredFields = ['query', 'user', 'password', 'account', 'warehouse', 'role', 'database', 'schema'];
        requiredFields.forEach(field => {
          if (!formData[field]) {
            newErrors.push({ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
          }
        });
        break;

      case 'Upload Files':
        const files = formData.files as File[];
        if (files?.some(file => file.size > 20 * 1024 * 1024)) {
          newErrors.push({ field: 'files', message: 'One or more files exceed 20MB limit' });
        }
        break;
    }

    fields.forEach(field => {
      if (field.required && !formData[field.key]) {
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
          const files = formData.files as File[];
          const uploadedSources = [];

          for (const file of files) {
            const fileFormData = new FormData();
            fileFormData.append('file', file);
            fileFormData.append('name', formData.source_name || file.name);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/upload`, {
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
          setTimeout(() => onClose(), 1000);
          return;
        }

        const dataSourcePayload = {
          name: formData.source_name || selectedSource,
          source_type: (selectedSource ?? '').toLowerCase().replace(' ', '_'),
          connection_settings: {}
        };

        const connectionSettings: Record<string, any> = {};
        const fields = getSourceFields();
        
        fields.forEach(field => {
          if (field.key !== 'source_name' && formData[field.key] !== undefined) {
            connectionSettings[field.key] = formData[field.key];
          }
        });

        dataSourcePayload.connection_settings = connectionSettings;

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data-sources/`, {
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
        window.dispatchEvent(new Event('sourceAdded'));
        setTimeout(() => onClose(), 1000);

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
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={Boolean(formData[field.key])}
                    onCheckedChange={(checked) => handleInputChange(field.key, String(checked))}
                    className="h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <Label htmlFor={field.key} className="text-sm font-normal">
                    {field.label}
                  </Label>
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
