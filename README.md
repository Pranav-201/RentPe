
# RentPe — Rent What You Need. Share What You Have.

<p align="center">
  <b>A peer-to-peer rental marketplace built for student communities.</b>
  <br />
  Making everyday essentials affordable, accessible, and reusable.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Backend-Zingoo.js-black?style=for-the-badge" alt="Zingoo.js" />
  <img src="https://img.shields.io/badge/AI-RAG-blueviolet?style=for-the-badge" alt="AI and RAG" />
  <img src="https://img.shields.io/badge/Cloud-Google%20Cloud-4285F4?style=for-the-badge" alt="Google Cloud" />
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Active Development" />
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-our-solution">Solution</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-powered-by-zingoo">Zingoo</a> •
  <a href="#-performance--benchmarks">Benchmarks</a> •
  <a href="#-architecture">Architecture</a>
</p>

---

## 🚀 Overview

**RentPe is a peer-to-peer rental marketplace designed to make underutilized student-owned items accessible to other students who need them temporarily.**

Students frequently purchase products they only use occasionally. At the same time, other students need those exact products but cannot justify buying them for short-term use.

RentPe connects these two groups through a single platform where students can discover items, explore rental opportunities, connect with owners, and make better use of existing resources.

Instead of purchasing something for occasional use, students can rent it from their campus community.

Instead of letting useful products sit unused, owners can make them available to others and earn from them.

**Our mission:** Turn idle student-owned products into useful, shareable resources.

## 🎯 The Problem

### 1. Students spend money on items they rarely use

College life often requires products such as:

- Scientific calculators and academic equipment
- Projectors and presentation equipment
- Tripods and photography accessories
- Bicycles and everyday essentials
- Induction stoves and other useful appliances

Many of these products are needed only for a particular assignment, event, semester, or short period.

Buying every item individually increases expenses, especially for students managing limited budgets.

### 2. Useful products remain underutilized

Students already own many products that spend most of their time unused.

There is no guarantee that another student who needs the same product will know that it is available nearby.

As a result, useful resources remain idle while other students purchase duplicate products.

### 3. Finding trustworthy rental options is difficult

Students may need to search multiple social groups, message people individually, or depend on informal word-of-mouth recommendations.

This makes discovering available items, comparing options, and contacting owners unnecessarily difficult.

### 4. Existing alternatives are not always designed for campus communities

Traditional rental services may focus on specific product categories, locations, or commercial transactions.

Students need a convenient way to discover everyday products available within their own community.

### The underlying problem

The problem is not simply a lack of products. It is the lack of an efficient way to connect people who already own useful products with people who need them temporarily.

## 💡 Our Solution

RentPe transforms a fragmented, informal rental process into a centralized student-to-student marketplace.

### How RentPe works

**For renters**

1. Discover products available for rent.
2. Explore relevant items and their details.
3. Find products that match their temporary needs.
4. Connect directly with the respective owner.
5. Coordinate the rental instead of purchasing an item they may rarely use.

**For owners**

1. List products they are willing to rent.
2. Make otherwise unused products discoverable.
3. Connect with interested students.
4. Earn from existing resources instead of leaving them idle.

### What makes RentPe valuable?

| Traditional approach | With RentPe |
|---|---|
| Purchase products for temporary needs | Explore rental alternatives |
| Search through scattered groups | Discover items in one marketplace |
| Depend entirely on word of mouth | Make listings discoverable |
| Leave unused products idle | Put existing resources to use |
| Coordinate without a centralized platform | Discover products and contact owners in one place |

RentPe is more than a product listing website. It is a community-driven marketplace built around affordability, resource sharing, and convenient access.

## ✨ Key Features

- **Peer-to-peer rentals:** Connect students who own products with students who need them.
- **Product discovery:** Explore available items and relevant product information.
- **Owner listings:** Make underutilized products available to the community.
- **Owner communication:** Contact product owners directly to discuss rentals.
- **Authentication:** Firebase Authentication with email/password and Google sign-in.
- **AI-powered discovery:** Explore a retrieval-augmented generation (RAG) approach to help users find relevant products using natural-language queries.
- **Semantic search infrastructure:** Use embeddings and a vector database to retrieve relevant product information.
- **Cloud deployment:** Deploy the frontend and backend as separate services.
- **Containerized backend:** Use Docker to support consistent backend packaging and deployment.

> Feature availability may evolve during development. Refer to the deployed application and repository for the current implementation.

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | Component-based user interface |
| Vite | Frontend development and build tooling |
| Tailwind CSS | Responsive styling |
| Firebase Authentication | User sign-in and identity |
| Vercel | Frontend deployment |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Zingoo.js | Backend framework and application infrastructure |
| MongoDB Atlas | Persistent application data |
| Firebase Admin / authentication integration | Backend identity verification |
| Cloudinary | Product image storage and delivery |
| Docker | Containerized backend deployment |
| Google Cloud Run | Backend hosting and scaling |

### AI and Retrieval-Augmented Generation

| Technology | Purpose |
|---|---|
| Groq | LLM inference |
| Gemini | Alternative LLM provider / fallback |
| Embeddings | Represent product information semantically |
| Pinecone | Vector storage and similarity search |
| RAG | Retrieve relevant context before generating an answer |

The AI pipeline follows the general flow:

`Product Data → Chunking / Preparation → Embeddings → Pinecone → Retrieval → LLM Response`

The exact steps depend on the type of query and the implemented retrieval pipeline.

## 🦉 Powered by Zingoo.js

One of the most important engineering decisions behind RentPe is its backend architecture.

**RentPe uses Zingoo.js, a Node.js backend framework that I am building as an open-source project.**

🔗 **Explore Zingoo:** https://zingoo.dev  
📦 **GitHub:** https://github.com/Pranav-201/Zingoo-The_Future_Backend  
📚 **Documentation:** https://zingoo-docs.vercel.app

### Why build RentPe with Zingoo?

Modern applications increasingly combine traditional backend functionality with AI capabilities.

Developers often need to assemble separate libraries, configure integrations, manage provider-specific behavior, and implement supporting infrastructure before focusing on application logic.

Zingoo aims to reduce this integration overhead by providing a more unified, developer-friendly backend development experience, including AI and RAG capabilities.

RentPe provides a practical application in which to develop and validate that approach.

### What this demonstrates

- **Real-world framework usage:** Zingoo is used in an actual marketplace application rather than only isolated examples.
- **Backend development:** Build application APIs and integrate supporting services.
- **AI integration:** Connect LLM providers and retrieval infrastructure.
- **Production deployment experience:** Package and deploy the backend on Google Cloud Run.
- **Integration testing:** Validate important application behavior and integrations.
- **Framework feedback:** Identify friction points through real application development and improve Zingoo accordingly.

The goal is not to replace every backend framework. It is to explore whether a more integrated developer experience can reduce the work required to build modern, AI-enabled backend applications.

## ⚡ Performance & Benchmarks

Backend quality is not determined by how quickly a developer writes a few lines of code. It also depends on runtime performance, maintainability, reliability, integration complexity, and operational overhead.

RentPe is an opportunity to evaluate Zingoo against these practical engineering requirements.

### 1. Developer productivity

Zingoo aims to reduce development time by simplifying common backend and AI integration workflows.

Potential areas of improvement include:

- Less repetitive integration code.
- Fewer manual steps when configuring AI capabilities.
- A more consistent application structure.
- Reduced effort when connecting providers and retrieval components.
- Faster iteration from implementation to testing.

These are development-productivity goals, not claims of measured time savings. A fair comparison should use the same requirements, features, and acceptance criteria.

### 2. Runtime performance

Backend runtime speed must be measured independently of development speed.

Useful metrics include:

| Metric | What it measures |
|---|---|
| p50 latency | Typical request latency |
| p95 latency | Latency experienced by slower requests |
| p99 latency | Tail latency |
| Requests per second | Request-processing throughput |
| Error rate | Percentage of failed requests |
| CPU and memory | Resource consumption under load |

### 3. AI integration performance

For AI-powered requests, distinguish application overhead from the time spent waiting for the model.

Relevant measurements include:

- Time spent preparing and retrieving context.
- Vector-search latency.
- Time to first token, where streaming is supported.
- Total LLM response time.
- End-to-end request latency.
- Token usage and provider costs.

A framework can improve integration simplicity without necessarily making the underlying model inference faster. These outcomes should be measured separately.

### 4. Reproducible benchmark methodology

For a meaningful comparison between Zingoo and another backend implementation:

1. Implement the same API endpoints and business logic.
2. Use equivalent database queries and indexes.
3. Keep hardware, region, payloads, and test duration consistent.
4. Warm up both implementations before measurement.
5. Test at multiple levels of concurrent load.
6. Run repeated trials and report the results.
7. Separate cold starts, database latency, and external LLM latency from application overhead.

Example tools include `autocannon` for HTTP load testing and `perf_hooks` for Node.js timing measurements.

### Benchmark results

| Metric | Result |
|---|---|
| Backend development time | Not yet independently benchmarked |
| p50 / p95 / p99 latency | Not yet published |
| Requests per second | Not yet published |
| Memory under load | Not yet published |
| AI integration time saved | Not yet independently measured |

**Our objective:** demonstrate whether Zingoo can reduce backend development effort and AI integration complexity while meeting the runtime performance and reliability requirements of a real application.

Measured results should be added here once repeatable tests have been conducted.

## 🏗️ Architecture

The high-level application architecture is:

```text
                  Student / User
                        |
                        v
                 React + Vite UI
                        |
             +----------+----------+
             |                     |
             v                     v
      Firebase Auth          Zingoo Backend
                                   |
                 +-----------------+-----------------+
                 |                 |                 |
                 v                 v                 v
           MongoDB Atlas       Cloudinary       AI / RAG Layer
                                                     |
                                           +---------+---------+
                                           |                   |
                                           v                   v
                                        Pinecone          LLM Providers
                                                          Groq / Gemini

             Frontend: Vercel
             Backend: Google Cloud Run
```

This diagram represents the logical system components. Firebase handles authentication, MongoDB stores application data, Cloudinary handles images, and the AI layer uses retrieval and language-model services where required.

## 🔐 Security & Reliability

Security and reliability are essential for a marketplace that handles user accounts and owner listings.

Areas to maintain and validate include:

- Verify Firebase identity tokens on protected backend endpoints.
- Enforce authorization on user-specific and owner-specific operations.
- Validate request payloads and reject invalid inputs.
- Keep API keys and secrets in environment variables or a managed secret store.
- Avoid exposing private credentials in frontend code.
- Apply suitable rate limits and error handling.
- Validate product ownership before allowing protected modifications.
- Monitor backend logs, resource consumption, and request failures.

These are security requirements and engineering practices; the exact implementation should be verified against the current codebase.

## 🚀 Deployment

The current deployment architecture separates the frontend and backend.

- **Frontend:** Vercel
- **Backend:** Google Cloud Run
- **Database:** MongoDB Atlas
- **Authentication:** Firebase Authentication
- **Image delivery:** Cloudinary
- **Vector search:** Pinecone

This separation allows the frontend, backend, database, and AI services to be managed independently.

## 🔮 Future Roadmap

Potential improvements include:

- Rental request and availability management.
- Rental duration and pricing workflows.
- Owner and renter ratings and reviews.
- Notifications for rental requests and updates.
- More advanced semantic product discovery.
- Improved AI-assisted recommendations.
- Automated end-to-end and load testing.
- Published, reproducible backend and AI benchmarks.
- Better monitoring and operational observability.

The roadmap is subject to implementation priorities and user feedback.

## 💻 Getting Started

### Prerequisites

- Node.js and npm
- A MongoDB Atlas connection string
- Firebase project configuration
- Cloudinary credentials
- Pinecone credentials if using the AI retrieval features
- Supported LLM provider credentials if using AI features

### Installation

Clone the repository:

```bash
git clone <YOUR_RENTPE_REPOSITORY_URL>
cd RentPe
```

Install dependencies:

```bash
npm install
```

Configure your environment variables using the project's environment example file, if available.

Start the application using the scripts defined in `package.json`.

```bash
npm run dev
```

> The exact commands may differ depending on whether the repository contains separate frontend and backend packages. Follow the package scripts and setup instructions in the relevant project directories.

## 👨‍💻 About the Developer

RentPe is built by **Pranav Amrutkar**, a software developer interested in backend engineering, AI systems, cloud infrastructure, and developer tools.

Alongside building RentPe, I am developing **Zingoo.js**, an open-source Node.js backend framework focused on making modern backend and AI application development more integrated and developer-friendly.

RentPe connects these interests in one practical project: building a useful product while applying and improving the backend technology behind it.

- **Portfolio:** https://amrutkarpranav.tech
- **GitHub:** https://github.com/Pranav-201
- **LinkedIn:** https://www.linkedin.com/in/pranavamrutkar20/
- **Zingoo:** https://zingoo.dev

## 🤝 Contributing

Contributions, bug reports, and suggestions are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Implement and test your changes.
4. Submit a pull request describing the change.

Please open an issue to discuss significant feature proposals before starting larger changes.

## 📄 License

See the repository's `LICENSE` file for the applicable license and usage terms.

---

<p align="center">
  <b>RentPe — Rent what you need. Share what you have.</b>
  <br />
  Building a more affordable and resourceful student community, one rental at a time.
</p>
