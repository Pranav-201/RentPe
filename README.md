<div align="center">

# RentPe

**Rent what you need. Share what you have.**

A peer-to-peer rental marketplace built for student communities.

<br/>

![Backend](https://img.shields.io/badge/Backend-Zingoo.js-000000?style=flat-square&labelColor=000000)
![AI](https://img.shields.io/badge/AI-RAG-000000?style=flat-square&labelColor=000000)
![Cloud](https://img.shields.io/badge/Cloud-Google_Cloud_Run-000000?style=flat-square&labelColor=000000)
![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat-square&labelColor=000000)
![Status](https://img.shields.io/badge/Status-Active-000000?style=flat-square&labelColor=000000)

<br/>

[Problem](#the-problem) · [Solution](#our-solution) · [Features](#key-features) · [Tech Stack](#tech-stack) · [Zingoo](#powered-by-zingoojs) · [Benchmarks](#performance--benchmarks) · [Architecture](#architecture)

</div>

---

## Overview

RentPe makes underutilized student-owned items available to other students who need them temporarily.

Students often buy products they only use occasionally, while other students need those same products but can't justify buying them. RentPe connects the two in one campus marketplace: discover items, contact owners, and make better use of what already exists.

> **Mission:** Turn idle student-owned products into useful, shareable resources.

---

## The Problem

| | |
|---|---|
| **Money spent on rarely-used items** | Calculators, projectors, tripods, bicycles, induction stoves. Often needed for one assignment, event, or semester, and expensive on a student budget. |
| **Useful products sit idle** | Students own plenty that goes unused, while others buy duplicates because they never knew an item was available nearby. |
| **Trustworthy options are hard to find** | Scattered social groups, one-by-one messages, and word of mouth make discovery slow and unreliable. |
| **Not built for campus communities** | Traditional rental services focus on specific categories, locations, or commercial deals, not everyday items within your own community. |

> The problem isn't a lack of products. It's the lack of an efficient way to connect people who own useful things with people who need them temporarily.

---

## Our Solution

RentPe replaces a fragmented, informal process with one student-to-student marketplace.

<table>
<tr>
<td width="50%" valign="top">

### For renters

1. Discover products available for rent
2. Explore items and their details
3. Find what matches your temporary need
4. Connect directly with the owner
5. Coordinate the rental instead of buying

</td>
<td width="50%" valign="top">

### For owners

1. List products you're willing to rent
2. Make unused items discoverable
3. Connect with interested students
4. Earn from resources that would sit idle

</td>
</tr>
</table>

| Traditional approach | With RentPe |
|---|---|
| Buy products for temporary needs | Explore rental alternatives |
| Search through scattered groups | Discover items in one marketplace |
| Depend on word of mouth | Make listings discoverable |
| Leave unused products idle | Put existing resources to use |
| Coordinate without a central platform | Find products and contact owners in one place |

---

## Key Features

- **Peer-to-peer rentals:** connect students who own products with students who need them
- **Product discovery:** explore available items and relevant product information
- **Owner listings:** make underutilized products available to the community
- **Owner communication:** contact owners directly to discuss rentals
- **Authentication:** Firebase Authentication with email/password and Google sign-in
- **AI-powered discovery:** a retrieval-augmented generation (RAG) approach for finding products with natural-language queries
- **Semantic search:** embeddings and a vector database to retrieve relevant product information
- **Cloud deployment:** frontend and backend deployed as separate services
- **Containerized backend:** Docker for consistent packaging and deployment

> Feature availability may evolve during development. Refer to the deployed application and repository for the current implementation.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React · Vite · Tailwind CSS · Firebase Authentication · Vercel |
| **Backend** | Node.js · Zingoo.js · MongoDB Atlas · Firebase Admin · Cloudinary · Docker · Google Cloud Run |
| **AI / RAG** | Groq (LLM inference) · Gemini (alternate / fallback) · Embeddings · Pinecone (vector search) |

<details>
<summary><b>What each piece does</b></summary>

<br/>

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Responsive styling |
| Firebase Authentication | User sign-in and identity |
| Vercel | Frontend deployment |
| Node.js | JavaScript runtime |
| Zingoo.js | Backend framework and application infrastructure |
| MongoDB Atlas | Persistent application data |
| Firebase Admin | Backend identity verification |
| Cloudinary | Product image storage and delivery |
| Docker | Containerized backend deployment |
| Google Cloud Run | Backend hosting and scaling |
| Groq | LLM inference |
| Gemini | Alternative LLM provider / fallback |
| Embeddings | Semantic representation of product information |
| Pinecone | Vector storage and similarity search |

</details>

**AI pipeline**

```text
Product Data → Chunking / Preparation → Embeddings → Pinecone → Retrieval → LLM Response
```

The exact steps depend on the type of query and the implemented retrieval pipeline.

---

## Powered by Zingoo.js

RentPe's backend runs on **Zingoo.js**, a Node.js backend framework I'm building as an open-source project.

[Website](https://zingoo.dev) · [GitHub](https://github.com/Pranav-201/Zingoo-The_Future_Backend) · [Documentation](https://zingoo-docs.vercel.app)

### Why build RentPe with Zingoo?

Modern applications combine traditional backend work with AI capabilities. Developers often assemble separate libraries, configure integrations, and handle provider-specific behavior before they can focus on application logic.

Zingoo aims to reduce that overhead with a unified, developer-friendly backend experience, including AI and RAG capabilities. RentPe is the real-world application where that approach is built and validated.

### What this demonstrates

- **Real-world usage:** Zingoo powers an actual marketplace, not only isolated examples
- **Backend development:** application APIs and supporting service integrations
- **AI integration:** LLM providers and retrieval infrastructure working together
- **Production deployment:** packaged and deployed on Google Cloud Run
- **Integration testing:** validating important behavior and integrations
- **Framework feedback:** real friction points drive improvements to Zingoo

> The goal isn't to replace every backend framework. It's to explore whether a more integrated developer experience can reduce the work needed to build modern, AI-enabled backend applications.

---

## Performance & Benchmarks

Backend quality isn't only how quickly a developer writes code. It also depends on runtime performance, maintainability, reliability, integration complexity, and operational overhead.

<details>
<summary><b>1. Developer productivity</b></summary>

<br/>

Zingoo aims to reduce development time by simplifying common backend and AI integration workflows:

- Less repetitive integration code
- Fewer manual steps when configuring AI capabilities
- A more consistent application structure
- Less effort connecting providers and retrieval components
- Faster iteration from implementation to testing

These are productivity goals, not claims of measured time savings. A fair comparison must use the same requirements, features, and acceptance criteria.

</details>

<details>
<summary><b>2. Runtime performance</b></summary>

<br/>

| Metric | What it measures |
|---|---|
| p50 latency | Typical request latency |
| p95 latency | Latency of slower requests |
| p99 latency | Tail latency |
| Requests per second | Throughput |
| Error rate | Percentage of failed requests |
| CPU and memory | Resource use under load |

</details>

<details>
<summary><b>3. AI integration performance</b></summary>

<br/>

Application overhead is separated from model wait time:

- Context preparation and retrieval time
- Vector-search latency
- Time to first token (where streaming is supported)
- Total LLM response time
- End-to-end request latency
- Token usage and provider cost

A framework can make integration simpler without making the underlying model faster, so these are measured separately.

</details>

<details>
<summary><b>4. Reproducible methodology</b></summary>

<br/>

1. Implement the same API endpoints and business logic
2. Use equivalent database queries and indexes
3. Keep hardware, region, payloads, and test duration consistent
4. Warm up both implementations before measuring
5. Test at multiple levels of concurrent load
6. Run repeated trials and report the results
7. Separate cold starts, database latency, and external LLM latency from application overhead

Example tools: `autocannon` for HTTP load testing, `perf_hooks` for Node.js timing.

</details>

### Results

| Metric | Result |
|---|---|
| Backend development time | Not yet independently benchmarked |
| p50 / p95 / p99 latency | Not yet published |
| Requests per second | Not yet published |
| Memory under load | Not yet published |
| AI integration time saved | Not yet independently measured |

**Objective:** show whether Zingoo can reduce backend development effort and AI integration complexity while meeting the runtime and reliability needs of a real application. Results will be added once repeatable tests have been run.

---

## Architecture

```text
                    Student / User
                          │
                          ▼
                 React + Vite UI  (Vercel)
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        Firebase Auth          Zingoo Backend  (Google Cloud Run)
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
        MongoDB Atlas            Cloudinary             AI / RAG Layer
                                                              │
                                                    ┌─────────┴─────────┐
                                                    ▼                   ▼
                                                Pinecone         LLM Providers
                                                                 (Groq / Gemini)
```

Firebase handles authentication, MongoDB stores application data, Cloudinary handles images, and the AI layer uses retrieval and language-model services where required.

---

## Security & Reliability

- Verify Firebase identity tokens on protected backend endpoints
- Enforce authorization on user-specific and owner-specific operations
- Validate request payloads and reject invalid inputs
- Keep API keys and secrets in environment variables or a managed secret store
- Never expose private credentials in frontend code
- Apply suitable rate limits and error handling
- Validate product ownership before allowing protected modifications
- Monitor backend logs, resource usage, and request failures

These are security requirements and engineering practices. Verify the exact implementation against the current codebase.

---

## Deployment

| Layer | Service |
|---|---|
| Frontend | Vercel |
| Backend | Google Cloud Run |
| Database | MongoDB Atlas |
| Authentication | Firebase Authentication |
| Image delivery | Cloudinary |
| Vector search | Pinecone |

Separating these layers lets the frontend, backend, database, and AI services be managed independently.

---

## Roadmap

- [ ] Rental request and availability management
- [ ] Rental duration and pricing workflows
- [ ] Owner and renter ratings and reviews
- [ ] Notifications for rental requests and updates
- [ ] More advanced semantic product discovery
- [ ] Improved AI-assisted recommendations
- [ ] Automated end-to-end and load testing
- [ ] Published, reproducible backend and AI benchmarks
- [ ] Better monitoring and observability

The roadmap is subject to implementation priorities and user feedback.

---

## Getting Started

**Prerequisites**

- Node.js and npm
- MongoDB Atlas connection string
- Firebase project configuration
- Cloudinary credentials
- Pinecone credentials (for AI retrieval features)
- Supported LLM provider credentials (for AI features)

**Installation**

```bash
git clone <YOUR_RENTPE_REPOSITORY_URL>
cd RentPe
npm install
```

Configure your environment variables using the project's environment example file, then start the app:

```bash
npm run dev
```

> Exact commands may differ if the repository has separate frontend and backend packages. Follow the scripts and setup instructions in each project directory.

---

## About the Developer

Built by **Pranav Amrutkar**, a software developer interested in backend engineering, AI systems, cloud infrastructure, and developer tools.

Alongside RentPe, I'm developing **Zingoo.js**, an open-source Node.js backend framework focused on making modern backend and AI application development more integrated and developer-friendly.

[Portfolio](https://amrutkarpranav.tech) · [GitHub](https://github.com/Pranav-201) · [LinkedIn](https://www.linkedin.com/in/pranavamrutkar20/) · [Zingoo](https://zingoo.dev)

---

## Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository
2. Create a feature branch
3. Implement and test your changes
4. Submit a pull request describing the change

Please open an issue to discuss significant feature proposals before starting larger changes.

## License

See the repository's `LICENSE` file for license and usage terms.

---

<div align="center">

**RentPe**
Rent what you need. Share what you have.

</div>
