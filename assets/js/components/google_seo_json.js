

    export function addJSONLDSchema({
        pageTitle,
        pageDescription,
        pageUrl,
        keywords = [],
        businessName = "V & V Brothers LLC",
        city = "Tracy",
        state = "CA",
        country = "US"
        }) {
            const schema = {
            "@context": "https://schema.org",
            "@graph": [
            {
                "@type": ["FinancialService", "EducationalOrganization"],
                "name": businessName,
                "description": pageDescription || "Empowering families with financial literacy, protection, and wealth-building strategies.",
                "address": {
                "@type": "PostalAddress",
                "addressLocality": city,
                "addressRegion": state,
                "addressCountry": country
            },
                "areaServed": country,
                "url": pageUrl || window.location.href,
                "keywords": keywords.join(", ")
            },
            {
                "@type": "WebPage",
                "name": pageTitle || document.title,
                "description": pageDescription,
                "url": pageUrl || window.location.href
            }
                ]
            };

                const script = document.createElement("script");
                script.type = "application/ld+json";
                script.text = JSON.stringify(schema);
                document.head.appendChild(script);
            }

                // Call on page load
                window.addEventListener("DOMContentLoaded", function() {
                addJSONLDSchema({
                    pageTitle: document.title,
                    pageDescription: document.querySelector('meta[name="description"]')?.content || "Learn financial foundations and strategies with V & V Brothers.",
                    keywords: ["financial education", "budgeting", "wealth building", "life insurance", "V & V Brothers"]
                });
    });

