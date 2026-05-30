# MM05 Production Deployment

## Stack
- Frontend: Vercel
- Backend: Railway
- Database/Auth: Supabase

## Commands

```bash
npm install
npm run build
```

## Docker

```bash
docker build -t mm05 .
docker run -p 80:80 mm05
```

## Security
- CSP enabled
- Secure headers enabled
- GitHub Actions CI/CD enabled
- Secret scanning enabled

## Railway
1. Connect GitHub repo
2. Railway detects Dockerfile automatically
3. Add environment variables
4. Deploy

## Vercel
1. Import project
2. Framework preset: Vite
3. Add VITE_* variables
4. Deploy
