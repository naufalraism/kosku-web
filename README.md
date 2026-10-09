# KosKu Web

React + TypeScript frontend for the [KosKu API](https://github.com/YOUR-USERNAME/kosku-api), a boarding-house (kost) management system.

**Stack:** React, TypeScript, Vite, Mantine, React Router.

## Run locally

1. Start the API (see the kosku-api README) so it listens on http://localhost:3000.
2. Then:

```bash
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
```

## Status

- [x] Login (JWT)
- [x] Rooms: list, add, delete
- [ ] Tenants
- [ ] Invoices
- [ ] Dashboard
