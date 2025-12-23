-- Create table for blocked domains
CREATE TABLE public.blocked_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  reason TEXT,
  category TEXT,
  risk_level TEXT DEFAULT 'high',
  blocked_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access (content blocker needs to fetch without auth)
ALTER TABLE public.blocked_domains ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read blocked domains (needed for content blocker)
CREATE POLICY "Anyone can read blocked domains" 
ON public.blocked_domains 
FOR SELECT 
USING (true);

-- Create index for faster domain lookups
CREATE INDEX idx_blocked_domains_domain ON public.blocked_domains(domain);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_blocked_domains_updated_at
BEFORE UPDATE ON public.blocked_domains
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some known malicious domain patterns for testing
INSERT INTO public.blocked_domains (domain, reason, category, risk_level) VALUES
('phishing-example.com', 'Known phishing domain', 'phishing', 'high'),
('scam-site-test.net', 'Fraudulent website', 'scam', 'high'),
('malware-download.org', 'Distributes malware', 'malware', 'critical');