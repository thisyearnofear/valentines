# lub-u

Share love with frens on Linea 💕

## Overview

lub-u is a social experiment on Linea mainnet that combines organic clicks with on-chain ownership. The project consists of three main components:

1. **Web App**: A Next.js application for interacting with the lub-u contract
2. **Farcaster Frame**: An embedded frame for sharing lub directly in Farcaster
3. **AI Agent**: A Gemini-powered agent that manages the treasury

## Architecture

### Smart Contracts (Linea Mainnet)

- **ClickLub Contract**: [`0x51510fD1FB5b6528D514F6bb484835A45AD71698`](https://lineascan.build/address/0x51510fD1FB5b6528D514F6bb484835A45AD71698)
- **Treasury Safe**: [`0x7e0A89A36Ba135A79aF121f443e20860845A731b`](https://app.safe.global/home?safe=lin:0x7e0A89A36Ba135A79aF121f443e20860845A731b)

### Web App

The web application is built with:

- Next.js 14 (App Router)
- Wagmi v2 for Web3 interactions
- ConnectKit for wallet connections
- TailwindCSS for styling

### Farcaster Frame

The Farcaster Frame integration allows users to:

- View current lub statistics
- Gift lub directly from Warpcast
- Connect with Frame-compatible wallets

### AI Agent

The treasury is managed by an AI agent powered by:

- Gemini Pro for decision making
- LangChain for tool orchestration
- Safe Protocol Kit for treasury management

## Development

First, create a `.env` file with the required environment variables:

```bash
# Required: Web3 Infrastructure
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_ALCHEMY_API_KEY=

# Required: AI Agent
GOOGLE_API_KEY=
AGENT_ADDRESS=

# Optional: LangSmith Tracing
LANGCHAIN_API_KEY=
LANGCHAIN_TRACING_V2=
LANGCHAIN_PROJECT=
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Testing

Test the AI agent's functionality:

```bash
npm run test:agent
```

Test Safe treasury control:

```bash
npm run test:safe
```

## Security Considerations

- Never commit private keys or sensitive API keys to the repository
- Use environment variables for all sensitive configuration
- The AI agent's private key should be stored securely and rotated regularly
- Monitor the Safe's activity through the [Safe UI](https://app.safe.global)

## Deployment

The app is deployed on Vercel with automatic deployments from the main branch. The Farcaster Frame metadata is served from the `.well-known` directory.

## Contributing

Contributions are welcome! Please check the issues page for current tasks or create a new issue to discuss proposed changes.

## License

MIT
