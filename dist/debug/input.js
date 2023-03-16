"use strict";
(() => {
  // src/input.ts
  function createEditor() {
    return new JSONEditor(document.getElementById("input-editor"), {
      required_by_default: true,
      display_required_only: true,
      theme: "spectre",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Produktname",
            minLength: 1
          },
          manufacturer: {
            type: "string",
            title: "Anbietername"
          },
          logo: {
            type: "string",
            title: "Dateiname Logo"
          },
          link: {
            type: "string",
            title: "Link zur Produkt-Website"
          },
          mediatype: {
            title: "Output des Produkts",
            type: "array",
            uniqueItems: true,
            items: {
              type: "string",
              enum: ["video", "audio", "text", "picture", "other"],
              options: {
                enum_titles: [
                  "Video",
                  "Audio",
                  "Text",
                  "Bild",
                  "Sonstiges"
                ]
              }
            }
          },
          description: {
            type: "string",
            title: "Produktbeschreibung (kurz)",
            input_width: "500px"
          },
          technologyReadinessLevel: {
            type: "string",
            format: "radio",
            title: "Technology-Readiness-Level",
            enum: [
              "basic-research",
              "applied-research",
              "first-applications",
              "mass-production"
            ],
            options: {
              enum_titles: [
                "Grundlagenforschung",
                "Angewandte Forschung",
                "Erste Anwendungen",
                "Massenproduktion"
              ]
            }
          },
          aiTechnologiesUsed: {
            type: "array",
            title: "Genannte KI-Technologien",
            uniqueItems: true,
            items: {
              type: "string",
              enum: ["CNN", "NN", "LSTM", "other"],
              options: {
                enum_titles: [
                  "Convolutional Neural Network",
                  "Neural Network",
                  "Long Short-Term Memory",
                  "Sonstiges"
                ]
              }
            }
          },
          categories: {
            type: "array",
            title: "Einordnung in Wertsch\xF6pfungskette",
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "BeschaffungInhalte",
                "AkquisitionWerbung",
                "ProduktionContent",
                "PlazierungWerbung",
                "Packaging",
                "TechnischeProduktion",
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
            type: "array",
            title: "Bezahlmodell",
            uniqueItems: true,
            items: {
              type: "string",
              enum: [
                "free",
                "freemium",
                "free-trial",
                "paid",
                "contact-for-pricing",
                "deals"
              ],
              options: {
                enum_titles: [
                  "Free",
                  "Freemium",
                  "Free Trial",
                  "Paid",
                  "Contact for Pricing",
                  "Deals"
                ]
              }
            }
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
    TEXTAREA_PARSED.push(product);
    const TEXTAREA_STRING = JSON.stringify(TEXTAREA_PARSED, null, 4);
    textarea.value = TEXTAREA_STRING;
  }
  var EDITOR = createEditor();
  var SUBMIT_BUTTON = document.querySelector("#submit");
  SUBMIT_BUTTON.addEventListener("click", () => {
    const errors = EDITOR.validate();
    const indicator = document.getElementById("valid_indicator");
    if (errors.length) {
      indicator.style.color = "red";
      indicator.textContent = "not valid";
      return;
    }
    indicator.textContent = "";
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
            <td>${NEW_PRODUCT["aiTechnologiesUsed"]}</td>
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
})();
