"use strict";
(() => {
    function s() {
        return new JSONEditor(document.getElementById("input-editor"), {
            required_by_default: !0,
            theme: "spectre",
            schema: {
                type: "object",
                properties: {
                    name: {
                        title: "Produktname",
                        type: "string",
                        minLength: 1,
                    },
                    manufacturer: {
                        title: "Anbietername",
                        type: "string",
                        minLength: 1,
                    },
                    logo: {
                        title: "Dateiname Logo",
                        type: "string",
                        minLength: 1,
                    },
                    link: {
                        title: "Link zur Produkt-Website",
                        type: "string",
                        minLength: 1,
                    },
                    mediatype: {
                        title: "Output des Produkts",
                        type: "array",
                        minItems: 1,
                        uniqueItems: !0,
                        items: {
                            type: "string",
                            enum: [
                                "video",
                                "audio",
                                "text",
                                "picture",
                                "other",
                            ],
                            options: {
                                enum_titles: [
                                    "Video",
                                    "Audio",
                                    "Text",
                                    "Bild",
                                    "Sonstiges",
                                ],
                            },
                        },
                    },
                    description: {
                        title: "Produktbeschreibung (kurz)",
                        type: "string",
                        minLength: 1,
                    },
                    technologyReadinessLevel: {
                        title: "Technology-Readiness-Level",
                        type: "string",
                        format: "radio",
                        enum: [
                            "basic-research",
                            "applied-research",
                            "first-applications",
                            "mass-production",
                        ],
                        options: {
                            enum_titles: [
                                "Grundlagenforschung",
                                "Angewandte Forschung",
                                "Erste Anwendungen",
                                "Massenproduktion",
                            ],
                        },
                    },
                    aiTechnologiesUsed: {
                        title: "Genannte KI-Technologien",
                        type: "array",
                        minItems: 1,
                        uniqueItems: !0,
                        items: {
                            type: "string",
                            enum: ["CNN", "NN", "LSTM", "other"],
                            options: {
                                enum_titles: [
                                    "Convolutional Neural Network",
                                    "Neural Network",
                                    "Long Short-Term Memory",
                                    "Sonstiges",
                                ],
                            },
                        },
                    },
                    categories: {
                        title: "Einordnung in Wertsch\xF6pfungskette",
                        type: "array",
                        minItems: 1,
                        uniqueItems: !0,
                        items: {
                            type: "string",
                            enum: [
                                "ProcurementContent",
                                "AcquisitionAdvertisement",
                                "ProductionContent",
                                "PlazierungWerbung",
                                "Packaging",
                                "TechnicalProduction",
                                "Distribution",
                            ],
                            options: {
                                enum_titles: [
                                    "Beschaffung von Informationen und Inhalten",
                                    "Akquisition von Werbung",
                                    "Produktion und Aggregation von Content",
                                    "Plazierung von Werbung",
                                    "Packaging der Produkte",
                                    "Technische Produktion",
                                    "Distribution",
                                ],
                            },
                        },
                    },
                    paymentModel: {
                        title: "Bezahlmodell",
                        type: "array",
                        minItems: 1,
                        uniqueItems: !0,
                        items: {
                            type: "string",
                            enum: [
                                "free",
                                "freemium",
                                "free-trial",
                                "paid",
                                "contact-for-pricing",
                                "deals",
                            ],
                            options: {
                                enum_titles: [
                                    "Free",
                                    "Freemium",
                                    "Free Trial",
                                    "Paid",
                                    "Contact for Pricing",
                                    "Deals",
                                ],
                            },
                        },
                    },
                    company_location: {
                        title: "Unternehmenssitz (Ort oder Land)",
                        type: "string",
                        required: !1,
                    },
                    funding: {
                        title: "Finanzierung / Funding (H\xF6he mit W\xE4hrung)",
                        type: "string",
                        required: !1,
                    },
                    revenue_per_year: {
                        title: "Jahresumsatz (mit W\xE4hrung)",
                        type: "string",
                        required: !1,
                    },
                    notes: {
                        title: "Bemerkungen",
                        type: "string",
                        required: !1,
                    },
                },
            },
        });
    }
    function d(n) {
        if (n == null || n.parentNode == null) return;
        let t = n.parentNode.parentNode;
        t == null || t.parentNode == null || t.parentNode.removeChild(t);
    }
    function c(n, t) {
        let i = JSON.parse(t.value);
        i.push(n);
        let r = JSON.stringify(i, null, 4);
        t.value = r;
    }
    function g() {
        let n = document.querySelector("#output-textarea").value,
            t = new Blob([n], { type: "text/plain" }),
            i = document.createElement("a");
        i.href = URL.createObjectURL(t);
        let r = new Date()
            .toISOString()
            .replace(/[-T:.Z]/g, "")
            .slice(0, 12);
        (i.download = `products_${r.slice(0, 8)}_${r.slice(8)}.json`),
            i.click(),
            URL.revokeObjectURL(i.href);
    }
    var o = s(),
        m = document.querySelector("#submit");
    m.addEventListener("click", () => {
        let n = o.validate(),
            t = document.getElementById("valid_indicator");
        if (n.length) {
            t.style.display = "inherit";
            return;
        }
        t.style.display = "none";
        let i = document.querySelector("#output-table"),
            r = document.querySelector("#output-textarea"),
            e = o.getValue();
        c(e, r);
        let u =
            e.logo == null || e.logo == "" ? "" : `<img src="img/${e.logo}">`;
        i.innerHTML += `
        <tr>
            <td>${e.name}</td>
            <td>${e.manufacturer}</td>
            <td>${u}</td>
            <td><a href="${e.link} target="_blank">${e.link}</a></td>
            <td>${e.mediatype}</td>
            <td>${e.description}</td>
            <td>${e.technologyReadinessLevel}</td>
            <td>${e.aiTechnologiesUsed}</td>
            <td>${e.categories}</td>
            <td>${e.paymentModel}</td>
            <td>
            <!--<button class="delete">x</button>-->
        </tr>
        `;
        let a = document.querySelectorAll("table button.delete");
        for (let l of a)
            l.addEventListener("click", function () {
                d(this);
            });
        o.destroy(), (o = s());
    });
    var p = document.querySelector("#download-button");
    p.addEventListener("click", () => {
        g();
    });
})();
