const mkcert = require('mkcert');
const fs = require('fs');
const path = require('path');

async function generateCertificates() {
  // Create certificates directory if it doesn't exist
  const certDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }

  // Create CA
  const ca = await mkcert.createCA({
    organization: 'AllChat Development CA',
    countryCode: 'IN',
    state: 'Maharashtra',
    locality: 'Development',
    validityDays: 365
  });

  // Create certificate
  const cert = await mkcert.createCert({
    domains: ['localhost', '127.0.0.1', '192.168.0.107'], // Add your local IP here
    validityDays: 365,
    caKey: ca.key,
    caCert: ca.cert
  });

  // Write certificates to files
  fs.writeFileSync(path.join(certDir, 'localhost.key'), cert.key);
  fs.writeFileSync(path.join(certDir, 'localhost.crt'), cert.cert);
  fs.writeFileSync(path.join(certDir, 'ca.key'), ca.key);
  fs.writeFileSync(path.join(certDir, 'ca.crt'), ca.cert);

  console.log('SSL certificates generated successfully in the certificates directory');
}

generateCertificates().catch(console.error);
