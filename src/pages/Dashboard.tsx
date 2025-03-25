import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, ContentCopy as CopyIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { urlService } from '../services/api';
import { socketService } from '../services/socket';
import { ShortenedUrl } from '../types';
import { useAuth } from '../context/AuthContext';

const validationSchema = yup.object({
  longUrl: yup
    .string()
    .url('Enter a valid URL')
    .required('URL is required'),
  validateDate: yup.date().required('Validation date is required'),
});

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<ShortenedUrl | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await loadUrls();
        const unsubscribe = socketService.subscribeToUrlUpdates((url) => {
          setUrls((prevUrls) => [...prevUrls, url]);
        });

        return () => {
          unsubscribe?.();
        };
      } catch (err) {
        setError('Failed to initialize dashboard');
      }
    };

    initialize();
  }, []);

  const loadUrls = async () => {
    try {
      const data = await urlService.getUrls();
      setUrls(data);
    } catch (err) {
      setError('Failed to load URLs');
    }
  };

  const formik = useFormik({
    initialValues: {
      longUrl: '',
      validateDate: new Date(),
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        await urlService.shortenUrl({
          longUrl: values.longUrl,
          validateDate: values.validateDate.toISOString(),
        });
        setSuccess('URL shortened successfully!');
        formik.resetForm();
      } catch (err) {
        setError('Failed to shorten URL');
      }
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await urlService.deleteUrl(id);
      setUrls((prevUrls) => prevUrls.filter((url) => url.id !== id));
      setSuccess('URL deleted successfully!');
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  const handleCopy = (url: ShortenedUrl) => {
    setSelectedUrl(url);
    setCopyDialogOpen(true);
  };

  const copyToClipboard = () => {
    if (selectedUrl) {
      navigator.clipboard.writeText(selectedUrl.shortUrl);
      setSuccess('URL copied to clipboard!');
      setCopyDialogOpen(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', px: 2 }}>
      <Typography variant="h4" gutterBottom align="center">
        Welcome, {user?.name}!
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Card sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center">
            Shorten URL
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="longUrl"
              name="longUrl"
              label="Long URL"
              value={formik.values.longUrl}
              onChange={formik.handleChange}
              error={formik.touched.longUrl && Boolean(formik.errors.longUrl)}
              helperText={formik.touched.longUrl && formik.errors.longUrl}
              margin="normal"
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Validation Date"
                value={formik.values.validateDate}
                onChange={(date) => formik.setFieldValue('validateDate', date)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: "normal",
                    error: formik.touched.validateDate && Boolean(formik.errors.validateDate),
                    helperText: formik.touched.validateDate && typeof formik.errors.validateDate === 'string' ? formik.errors.validateDate : '',
                  }
                }}
              />
            </LocalizationProvider>
            <Button
              color="primary"
              variant="contained"
              type="submit"
              sx={{ mt: 2 }}
            >
              Shorten URL
            </Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>
        Your Shortened URLs
      </Typography>
      <List>
        {urls.map((url) => (
          <ListItem key={url.id}>
            <ListItemText
              primary={url.shortUrl}
              secondary={`Original: ${url.longUrl}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="copy"
                onClick={() => handleCopy(url)}
                sx={{ mr: 1 }}
              >
                <CopyIcon />
              </IconButton>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleDelete(url.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)}>
        <DialogTitle>Copy Shortened URL</DialogTitle>
        <DialogContent>
          <Typography>
            Your shortened URL is: <strong>{selectedUrl?.shortUrl}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
          <Button onClick={copyToClipboard} color="primary">
            Copy to Clipboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 