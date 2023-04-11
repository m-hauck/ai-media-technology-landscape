"use strict";
(() => {
  // src/aimtl-input.ts
  function trimProductWhitespace(product) {
    const trimmedProduct = {};
    for (const [key, value] of Object.entries(product)) {
      if (typeof value === "string") {
        trimmedProduct[key] = value.trim();
      } else {
        trimmedProduct[key] = value;
      }
    }
    return trimmedProduct;
  }
  function createEditor() {
    return new JSONEditor(document.getElementById("input-editor"), {
      required_by_default: true,
      theme: "spectre",
      schema: {
        type: "object",
        properties: {
          name: {
            title: "Product name",
            type: "string",
            minLength: 1
          },
          manufacturer: {
            title: "Manufacturer",
            type: "string",
            minLength: 1
          },
          productAvailable: {
            title: "Product available?",
            type: "string",
            format: "radio",
            enum: ["true", "false"],
            options: {
              enum_titles: ["Yes", "No"]
            }
          },
          logo: {
            title: "File name of logo (vector graphics if possible)",
            type: "string",
            minLength: 1
          },
          link: {
            title: "Link to the product website",
            type: "string",
            minLength: 1
          },
          mediatype: {
            title: "Product output",
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
              type: "string",
              enum: ["video", "audio", "text", "picture", "other"],
              options: {
                enum_titles: [
                  "Video",
                  "Audio",
                  "Text",
                  "Pictures",
                  "Other"
                ]
              }
            }
          },
          description: {
            title: "Product description (short)",
            type: "string",
            minLength: 1
          },
          technologyReadinessLevel: {
            title: "Technology-Readiness-Level",
            type: "string",
            format: "radio",
            enum: [
              "basic-research",
              "applied-research",
              "first-applications",
              "mass-production"
            ],
            options: {
              enum_titles: [
                "Basic research",
                "Applied research",
                "First applications",
                "Mass production"
              ]
            }
          },
          categories: {
            title: "Classification in value chain",
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "ProcurementContent",
                "AcquisitionAdvertisement",
                "ProductionContent",
                "AdvertisementPlacement",
                "Packaging",
                "TechnicalProduction",
                "Distribution"
              ],
              options: {
                enum_titles: [
                  "Beschaffung von Informationen und Inhalten",
                  "Akquisition von Werbung",
                  "Produktion und Aggregation von Content",
                  "Plazierung von Werbung",
                  "Packaging der Produkte",
                  "Technische Produktion",
                  "Distribution"
                ]
              }
            }
          },
          paymentModel: {
            title: "Payment model",
            type: "array",
            minItems: 1,
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "free",
                "freemium",
                "paid-once",
                "paid-periodically",
                "paid-with-premium-extra",
                "contact-for-pricing"
              ],
              options: {
                enum_titles: [
                  "Free",
                  "Free with premium extras (Freemium)",
                  "Paid once",
                  "Paid with premium extras",
                  "Paid periodically (subscription)",
                  "Contact for Pricing"
                ]
              }
            }
          },
          companyLocation: {
            title: "Company headquarters (city or country)",
            type: "string",
            required: false
          },
          funding: {
            title: "Funding (amount with currency)",
            type: "string",
            required: false
          },
          revenuePerYear: {
            title: "Revenue per year (with currency)",
            type: "string",
            required: false
          },
          notes: {
            title: "Notes",
            type: "string",
            required: false
          }
        }
      }
    });
  }
  function deleteTableRow(button) {
    if (button == null || button.parentNode == null)
      return;
    const row = button.parentNode.parentNode;
    if (row == null || row.parentNode == null)
      return;
    row.parentNode.removeChild(row);
  }
  function addNewProductToTextarea(product, textarea) {
    let TEXTAREA_PARSED = JSON.parse(textarea.value);
    TEXTAREA_PARSED.push(trimProductWhitespace(product));
    const TEXTAREA_STRING = JSON.stringify(TEXTAREA_PARSED, null, 4);
    textarea.value = TEXTAREA_STRING;
  }
  function downloadOutputCode() {
    const CODE = document.querySelector("#output-textarea").value;
    const FILE = new Blob([CODE], { type: "text/plain" });
    const ANCHOR = document.createElement("a");
    ANCHOR.href = URL.createObjectURL(FILE);
    const TIMESTAMP = (/* @__PURE__ */ new Date()).toISOString().replace(/[-T:.Z]/g, "").slice(0, 12);
    ANCHOR.download = `products_${TIMESTAMP.slice(0, 8)}_${TIMESTAMP.slice(
      8
    )}.json`;
    ANCHOR.click();
    URL.revokeObjectURL(ANCHOR.href);
  }
  var EDITOR = createEditor();
  var SUBMIT_BUTTON = document.querySelector("#submit");
  SUBMIT_BUTTON.addEventListener("click", () => {
    const errors = EDITOR.validate();
    const indicator = document.getElementById("valid_indicator");
    if (errors.length) {
      indicator.style.display = "inherit";
      return;
    }
    indicator.style.display = "none";
    const OUTPUT_TABLE_BODY = document.querySelector("#output-table");
    const OUTPUT_TEXTAREA = document.querySelector("#output-textarea");
    const NEW_PRODUCT = EDITOR.getValue();
    addNewProductToTextarea(NEW_PRODUCT, OUTPUT_TEXTAREA);
    const LOGO_STRING = NEW_PRODUCT["logo"] == null || NEW_PRODUCT["logo"] == "" ? "" : `<img src="img/${NEW_PRODUCT["logo"]}">`;
    OUTPUT_TABLE_BODY.innerHTML += `
        <tr>
            <td>${NEW_PRODUCT["name"]}</td>
            <td>${NEW_PRODUCT["manufacturer"]}</td>
            <td>${LOGO_STRING}</td>
            <td><a href="${NEW_PRODUCT["link"]} target="_blank">${NEW_PRODUCT["link"]}</a></td>
            <td>${NEW_PRODUCT["mediatype"]}</td>
            <td>${NEW_PRODUCT["description"]}</td>
            <td>${NEW_PRODUCT["technologyReadinessLevel"]}</td>
            <td>${NEW_PRODUCT["paymentModel"]}</td>
            <td>${NEW_PRODUCT["categories"]}</td>
            <td>${NEW_PRODUCT["paymentModel"]}</td>
            <td>
            <!--<button class="delete">x</button>-->
        </tr>
        `;
    const deleteButtons = document.querySelectorAll(
      "table button.delete"
    );
    for (const button of deleteButtons) {
      button.addEventListener("click", function() {
        deleteTableRow(this);
      });
    }
    EDITOR.destroy();
    EDITOR = createEditor();
  });
  var DOWNLOAD_BUTTON = document.querySelector("#download-button");
  DOWNLOAD_BUTTON.addEventListener("click", () => {
    downloadOutputCode();
  });
})();
