# 🤖 Use of GenAI for Learning

This document outlines how Generative AI was utilized throughout the development of Garity to accelerate learning and overcome technical hurdles.

## 1. Learning Next.js App Router (React Server Components)

Transitioning to Next.js 15 meant adopting the new App Router paradigm, which heavily emphasizes React Server Components (RSC) and streaming.

**How GenAI helped:**
- **Concept Clarification:** I used GenAI to explain the exact differences between `"use client"` and server-side components. 
- **Prompt Example:** *"Explain Next.js 15 Server Components vs Client Components. When should I use which if I want to fetch dynamic pricing data but also have an interactive search bar?"*
- **Outcome:** This helped me correctly architect `src/app/page.js` as a client component to handle the search state, while planning the API routes for server-side execution.

## 2. Mastering Python Playwright for Web Scraping

Standard HTML scraping libraries (like `requests` + `BeautifulSoup`) fail when data is loaded dynamically via JavaScript or protected by anti-bot measures. I needed to learn how to bypass this.

**How GenAI helped:**
- **Tool Discovery & Setup:** GenAI recommended Playwright over Selenium for modern, headless scraping and provided boilerplate setup code.
- **Prompt Example:** *"How can I scrape a website using Python that requires JavaScript to render the listings? Give me an example using Playwright."*
- **Outcome:** I successfully implemented the Playwright fallback mechanism in `scraper/scraper.py`, allowing Garity to scrape high-quality images and details that were otherwise hidden.

## 3. Data Visualization with Recharts

Visualizing the "6-month price trend" using sparklines was a key feature, but setting up SVG charts from scratch is time-consuming.

**How GenAI helped:**
- **Component Generation:** I used GenAI to help generate a minimal, responsive sparkline component.
- **Prompt Example:** *"Write a React component using Recharts that displays a minimalist sparkline chart for a 6-month price history. It shouldn't have axes or grids, just a smooth line."*
- **Outcome:** The `Sparkline` component was built quickly and integrated perfectly into the `CarCard` UI.

## Conclusion

GenAI acted as an interactive pair-programmer and mentor. Instead of blindly copying code, I used it to understand **why** certain architectural patterns are used, enabling me to creatively integrate a Python scraper with a modern Next.js frontend.
