# Annature NodeJS Client

## This library is incomplete

And this is not an official Annature library, it has been developed ad-hoc without yet being fully tested.

Some types may be incorrect and some functions are missing (such as `envelopes.update`), as the official Annature API documentation is also incomplete.

## Installation

```bash
yarn add annature
```

## Documentation

[Annature REST API](https://documentation.annature.com.au)

## Usage

```typescript
import { Annature, Role } from 'annature';

const annature = new Annature({ id: 'Your Annature ID', key: 'Your Annature key' });

// Get admins.
const accounts = await annature.accounts.list({ role: Role.Administrator });

// Retrieve a document.
const document = await annature.documents.retrieve('7e8f68e4c6df9395cd7ff48d69d7e2c1', {
  envelopeId: 'c64ce66b70b21c03bfd5dfa0ab14b730',
});

// Send an envelope.
await annature.envelopes.send('c64ce66b70b21c03bfd5dfa0ab14b730');
```
