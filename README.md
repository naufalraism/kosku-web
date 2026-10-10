**Live demo:** https://kosku-web.naufal-majid.workers.dev
Runs entirely in your browser on sample data; no backend is called.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6db9f9dd-8e38-48cd-832a-eaea10e8f2b0" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ba576888-1f9e-4206-a447-a05d4573a09e" />

# KosKu Web

React + TypeScript frontend for the [KosKu API](https://github.com/naufalraism/Kosku), a boarding-house (kost) management system.

**Stack:** React, TypeScript, Vite, Mantine, React Router.

## Run locally

1. Start the API (see the kosku-api README) so it listens on http://localhost:3000.
2. Then:

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c47081aa-07ff-41a1-8c24-b103589edfa2" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/52ae8139-945d-4868-a612-7b22d8148a52" />

## Status

- [x] Login (JWT)
- [x] Rooms: list, add, delete
- [ ] Tenants
- [ ] Invoices
- [ ] Dashboard
