# Product Requirements Document (PRD)

## Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | SME Product Admin |
| **Author** | Product Team |
| **Created** | 2026-01-08 |
| **Status** | Draft |
| **Priority** | High |
| **Sprint/Release** | MVP Release |
| **Estimated Effort** | Large |

---

## 1. Problem Statement

### What problem are we solving?
Administrators need the ability to configure and manage insurance products that are displayed on the SME Portal (a separate public-facing application). Currently, there is no backoffice interface to add new products, modify existing product features, update pricing, or manage product bundles. This forces manual data entry and makes it difficult to maintain product catalogues across multiple countries and insurers.

### Why is this important now?
The SME Portal is being developed to allow SME clients to self-service their insurance needs. The portal requires a backend product catalogue that administrators can maintain. Without this admin module, the portal cannot display accurate product information, pricing, or bundles.

### Current State
Product information is managed manually or through direct database updates, which is error-prone and requires technical knowledge. There is no user-friendly interface for non-technical administrators to manage the product catalogue.

---

## 2. Objectives & Success Criteria

### Primary Objective
Provide administrators with a comprehensive backoffice interface to manage SME insurance products, plans, pricing, and bundles that feed into the SME Portal.

### Success Criteria

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Admin efficiency | 80% reduction in time to update products | Compare time before/after implementation |
| Data accuracy | 100% product data matches portal display | Automated validation |
| User adoption | All PS team members can manage products | Training completion |

---

## 3. User Stories

### Primary User Story
**As an** Administrator (PS Team member)
**I want to** manage SME insurance products from a backoffice interface
**So that** I can configure products, plans, pricing, and bundles displayed on the SME Portal

### Acceptance Criteria

```gherkin
Scenario: View all products
  Given I am logged in as an Administrator
  When I navigate to the SME Products page
  Then I see a grid listing all insurance products
  And I can filter by country, category, and status
  And I can see product name, category, insurer, and active status
```

### Additional User Stories

#### Story 2: Add New Product
**As an** Administrator
**I want to** add a new insurance product
**So that** it becomes available for configuration and display on the portal

**Acceptance Criteria:**
```gherkin
Scenario: Create new product
  Given I am on the SME Products page
  When I click "Add Product"
  Then I see a form with product details fields
  And I can specify product code, name, category, description
  And I can set the product as a default recommendation
  And I can define product dependencies
  When I save the product
  Then it appears in the products grid
```

#### Story 3: Manage Product Plans
**As an** Administrator
**I want to** configure multiple plan tiers for a product
**So that** customers can choose different coverage levels (Gold/Silver/Bronze)

**Acceptance Criteria:**
```gherkin
Scenario: Add plan to product
  Given I am editing a product
  When I navigate to the Plans tab
  Then I see existing plans for this product
  When I click "Add Plan"
  Then I can specify plan name, tier level, and coverage details
  And I can configure benefit limits for each plan
```

#### Story 4: Manage Pricing
**As an** Administrator
**I want to** configure age-banded premium rates for each plan
**So that** the portal can calculate accurate quotes based on member ages

**Acceptance Criteria:**
```gherkin
Scenario: Configure age-banded pricing
  Given I am editing a product plan
  When I navigate to the Pricing tab
  Then I see a grid of age bands with premium rates
  And I can set different rates for Compulsory vs Voluntary
  And I can set different rates for Employee vs Dependent
  When I save the pricing
  Then the rates are stored and used for portal quotes
```

#### Story 5: Configure Portal Bundles
**As an** Administrator
**I want to** configure product bundles (Gold/Silver/Bronze) for the portal
**So that** customers see pre-configured package options

**Acceptance Criteria:**
```gherkin
Scenario: Create product bundle
  Given I am on the Bundles configuration page
  When I create a new bundle named "Gold"
  Then I can select which products are included
  And I can map each product to a specific plan tier
  And I can set the bundle display order and "Most Popular" tag
```

#### Story 6: Manage Product Dependencies
**As an** Administrator
**I want to** define product dependencies (e.g., "Critical Illness requires Group Term Life")
**So that** the portal enforces valid product selections

**Acceptance Criteria:**
```gherkin
Scenario: Set product dependency
  Given I am editing a product
  When I configure dependencies
  Then I can select required parent products
  And the portal will enforce these rules during selection
```

---

## 4. Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-01 | Products grid with search, filter, and pagination | Must Have | Similar to Clients page |
| FR-02 | Product CRUD operations (Create, Read, Update, Delete) | Must Have | |
| FR-03 | Plan management within products | Must Have | Multiple plan tiers per product |
| FR-04 | Benefit schedule configuration per plan | Must Have | |
| FR-05 | Age-banded pricing configuration | Must Have | Compulsory/Voluntary rates |
| FR-06 | Product dependency rules | Must Have | e.g., CI requires GTL |
| FR-07 | Country/Region configuration | Must Have | Singapore, Hong Kong |
| FR-08 | Insurer management | Must Have | AIA, Chubb, Liberty |
| FR-09 | Bundle configuration for portal | Must Have | Gold/Silver/Bronze |
| FR-10 | Product category management | Should Have | Life, Medical, Additional |
| FR-11 | Clone/copy product functionality | Should Have | For creating similar products |
| FR-12 | Product version history/audit trail | Could Have | |
| FR-13 | Bulk pricing import/export (Excel) | Could Have | |

### Detailed Requirements

#### FR-01: Products Grid
- **Description:** Main listing page showing all SME products with search and filter capabilities
- **Filters:** Country, Category, Insurer, Status (Active/Inactive), Default Recommendation (Yes/No)
- **Columns:** Product Code, Product Name, Category, Insurer, Country, Plans Count, Status, Default Recommendation
- **Actions:** Add, Edit, Clone, Delete, View Details

#### FR-02: Product Details Form
- **Fields:**
  - Product Code (unique identifier, e.g., "GTL", "GHS")
  - Product Name (e.g., "Group Term Life")
  - Category (Life & Protection / Medical / Additional)
  - Description (rich text for portal display)
  - Short Description (summary for cards)
  - Insurer (dropdown)
  - Country (dropdown)
  - Is Default Recommendation (Yes/No)
  - Is Active (Yes/No)
  - Display Order (for portal sorting)
  - Icon/Image (for portal display)

#### FR-03: Plan Management
- **Per Plan Fields:**
  - Plan Code (e.g., "Plan1", "Gold")
  - Plan Name (e.g., "1 Bed Private", "Gold Plan")
  - Plan Tier (1-5 or Bronze/Silver/Gold)
  - Description
  - Ward Type (for GHS: 1 Bed Pte, 2 Bed Pte, 4 Bed Pte, etc.)
  - Is Active

#### FR-04: Benefit Schedule
- **Per Benefit Fields:**
  - Benefit Code
  - Benefit Name (e.g., "Daily Room & Board")
  - Benefit Limit (numeric or "As Charged")
  - Limit Type (Per Disability / Per Policy Year / Per Visit)
  - Sub-limits (for nested benefits)
  - Conditions/Notes

#### FR-05: Age-Banded Pricing
- **Pricing Grid Columns:**
  - Age Band (e.g., "39 and below", "40-44", "45-49", etc.)
  - Compulsory - Employee Rate
  - Compulsory - Dependent Rate
  - Voluntary - Employee Rate
  - Voluntary - Dependent Rate
- **Age Bands:** 39 and below, 40-44, 45-49, 50-54, 55-59, 60-64, 65-69, 70-74

---

## 5. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Product grid loads in < 2 seconds with 100+ products |
| **Accessibility** | Form fields have proper labels and tab order |
| **Browser Support** | Chrome, Firefox, Edge - latest 2 versions |
| **Mobile/Responsive** | Desktop-first, tablet support nice-to-have |
| **Security** | Role-based access - only Administrators can modify products |

---

## 6. UI/UX Considerations

### Similar Existing Feature
This should work similar to the **Clients grid page** (`Views/Client/Clients.cshtml`) with:
- Tab-based navigation (Products List, Key Statistics)
- Collapsible search panel with filters
- Kendo Grid for product listing
- Detail/Edit page for individual products

### Wireframe - Products List Page

```
+------------------------------------------------------------------+
|  SME Product Admin                                                |
+------------------------------------------------------------------+
|  [Products]  [Bundles]  [Reference Data]                    (tabs)|
+------------------------------------------------------------------+
|  [Search Panel - Collapsible]                                     |
|  Country: [Dropdown]  Category: [Dropdown]  Insurer: [Dropdown]   |
|  Status: [Dropdown]   Name: [Text Input]                          |
|  [Search]  [Reset]                                                |
+------------------------------------------------------------------+
|  Product Grid                                                     |
|  +--------------------------------------------------------------+ |
|  | Code | Name           | Category    | Insurer | Country | ... | |
|  |------|----------------|-------------|---------|---------|-----| |
|  | GTL  | Group Term Life| Life & Prot | AIA     | SG      | ... | |
|  | GPA  | Personal Accid | Life & Prot | Chubb   | SG      | ... | |
|  | GHS  | Hospital & Sur | Medical     | AIA     | SG      | ... | |
|  +--------------------------------------------------------------+ |
|  [Pagination: 1 2 3 ... 10]                                       |
+------------------------------------------------------------------+
|  [+ Add Product]  [Export]                                        |
+------------------------------------------------------------------+
```

### Wireframe - Product Details Page

```
+------------------------------------------------------------------+
|  < Back to Products                                               |
|  Product: Group Term Life (GTL)                        [Save] [X] |
+------------------------------------------------------------------+
|  [Details]  [Plans]  [Dependencies]                         (tabs)|
+------------------------------------------------------------------+
|  DETAILS TAB:                                                     |
|  +--------------------------------------------------------------+ |
|  | Product Information                                          | |
|  | Code: [GTL]         Name: [Group Term Life        ]          | |
|  | Category: [Life & Protection v]  Insurer: [AIA v]            | |
|  | Country: [Singapore v]           Status: [Active v]          | |
|  | Default Recommendation: [x] Yes  [ ] No                      | |
|  | Description: [Rich text editor...                     ]      | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
|  PLANS TAB:                                                       |
|  +--------------------------------------------------------------+ |
|  | Plans Grid                                     [+ Add Plan]  | |
|  | Code   | Name              | Tier | Status | Actions         | |
|  |--------|-------------------|------|--------|-----------------|  |
|  | Plan1  | Core / Buy down   | 1    | Active | [Edit] [Delete] | |
|  | Plan2  | Buy up            | 2    | Active | [Edit] [Delete] | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  Plan Details (when editing):                                     |
|  +--------------------------------------------------------------+ |
|  | Benefits Schedule                                            | |
|  | Benefit            | Limit        | Type          | Notes   | |
|  |--------------------|--------------|---------------|---------|  |
|  | Death              | As Charged   | Per Disability|         | |
|  | TPD                | As Charged   | Per Disability|         | |
|  | Terminal Illness   | As Charged   | Per Disability|         | |
|  +--------------------------------------------------------------+ |
|                                                                   |
|  | Pricing (Age-Banded)                                         | |
|  | Age Band    | Compulsory | Voluntary |                       | |
|  |-------------|------------|-----------|                       | |
|  | 39 & below  | $0.38      | $0.50     |                       | |
|  | 40-44       | $0.43      | $0.58     |                       | |
|  | 45-49       | $0.75      | $0.98     |                       | |
|  +--------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

### Key UI Components
- [x] Data Grid (Kendo Grid) - Products list, Plans list, Pricing grid
- [x] Search/Filter Panel - Country, Category, Insurer, Status filters
- [x] Form with validation - Product details, Plan details
- [x] Modal dialog - Confirm delete, Add plan
- [ ] Dashboard widgets - (Future: Product statistics)
- [ ] Charts/Graphs - (Future: Pricing trends)
- [ ] File upload - (Future: Product images)
- [x] Tabs - Product details tabs, Page-level tabs

---

## 7. Data Requirements

### New Data Entities

#### SMEProduct
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| ProductId | int | Yes (auto) | | Primary key |
| ProductCode | string(20) | Yes | Unique | e.g., "GTL", "GHS" |
| ProductName | string(200) | Yes | | Display name |
| CategoryId | int | Yes | FK | Life/Medical/Additional |
| InsurerId | int | Yes | FK | AIA, Chubb, etc. |
| CountryId | int | Yes | FK | SG, HK |
| Description | string(max) | No | | Rich text description |
| ShortDescription | string(500) | No | | Summary for cards |
| IsDefaultRecommendation | bool | Yes | | Show by default on portal |
| IsActive | bool | Yes | | Active/Inactive |
| DisplayOrder | int | No | | Portal sort order |
| CreatedDate | datetime | Yes (auto) | | |
| ModifiedDate | datetime | Yes (auto) | | |

#### SMEProductPlan
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| PlanId | int | Yes (auto) | | Primary key |
| ProductId | int | Yes | FK | Parent product |
| PlanCode | string(20) | Yes | Unique per product | e.g., "Plan1" |
| PlanName | string(100) | Yes | | e.g., "1 Bed Private" |
| TierLevel | int | Yes | 1-5 | Plan tier ordering |
| WardType | string(50) | No | | For GHS plans |
| IsActive | bool | Yes | | |
| DisplayOrder | int | No | | |

#### SMEPlanBenefit
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| BenefitId | int | Yes (auto) | | Primary key |
| PlanId | int | Yes | FK | Parent plan |
| BenefitCode | string(50) | Yes | | e.g., "ROOM_BOARD" |
| BenefitName | string(200) | Yes | | Display name |
| BenefitLimit | decimal | No | | Numeric limit |
| LimitText | string(100) | No | | e.g., "As Charged" |
| LimitType | string(50) | Yes | | PerDisability/PerYear/PerVisit |
| ParentBenefitId | int | No | FK | For sub-benefits |
| Notes | string(500) | No | | Conditions |
| DisplayOrder | int | No | | |

#### SMEPlanPricing
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| PricingId | int | Yes (auto) | | Primary key |
| PlanId | int | Yes | FK | Parent plan |
| AgeBandId | int | Yes | FK | Age range |
| CompulsoryEmployeeRate | decimal | No | >= 0 | Rate per $1000 SA |
| CompulsoryDependentRate | decimal | No | >= 0 | |
| VoluntaryEmployeeRate | decimal | No | >= 0 | |
| VoluntaryDependentRate | decimal | No | >= 0 | |

#### SMEProductDependency
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| DependencyId | int | Yes (auto) | | Primary key |
| ProductId | int | Yes | FK | Child product |
| RequiredProductId | int | Yes | FK | Required parent product |

#### SMEBundle
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| BundleId | int | Yes (auto) | | Primary key |
| BundleCode | string(20) | Yes | Unique | e.g., "GOLD" |
| BundleName | string(100) | Yes | | e.g., "Gold Plan" |
| CountryId | int | Yes | FK | |
| IsMostPopular | bool | No | | Show "Most Popular" tag |
| DisplayOrder | int | No | | |
| IsActive | bool | Yes | | |

#### SMEBundleProduct
| Field Name | Type | Required | Validation | Description |
|------------|------|----------|------------|-------------|
| BundleProductId | int | Yes (auto) | | Primary key |
| BundleId | int | Yes | FK | Parent bundle |
| ProductId | int | Yes | FK | |
| PlanId | int | Yes | FK | Which plan tier |

### Reference Data

#### ProductCategory
| CategoryId | CategoryName |
|------------|--------------|
| 1 | Life & Protection Benefits |
| 2 | Medical Benefits |
| 3 | Additional Benefits |

#### Insurer
| InsurerId | InsurerName | InsurerCode |
|-----------|-------------|-------------|
| 1 | AIA Singapore | AIA_SG |
| 2 | Chubb Singapore | CHUBB_SG |
| 3 | Liberty Insurance HK | LIBERTY_HK |
| 4 | Chubb Hong Kong | CHUBB_HK |

#### AgeBand
| AgeBandId | AgeBandName | MinAge | MaxAge |
|-----------|-------------|--------|--------|
| 1 | 39 and below | 0 | 39 |
| 2 | 40 - 44 | 40 | 44 |
| 3 | 45 - 49 | 45 | 49 |
| 4 | 50 - 54 | 50 | 54 |
| 5 | 55 - 59 | 55 | 59 |
| 6 | 60 - 64 | 60 | 64 |
| 7 | 65 - 69 | 65 | 69 |
| 8 | 70 - 74 | 70 | 74 |

### Sample Data - Products
```json
{
  "productId": 1,
  "productCode": "GTL",
  "productName": "Group Term Life",
  "categoryId": 1,
  "insurerId": 1,
  "countryId": 1,
  "description": "Provide 24-hour worldwide coverage against Death or Total & Permanent Disability (TPD) to any cause, including illness and accident.",
  "isDefaultRecommendation": true,
  "isActive": true,
  "displayOrder": 1
}
```

---

## 8. Out of Scope

The following items are explicitly NOT part of this release:

1. **API integration** with insurer quotation engines
2. **Real-time pricing** from external sources
3. **Multi-language support** for product descriptions
4. **Version control** for product changes
5. **Workflow/approval process** for product updates
6. **Integration with LocktonConnect** database
7. **Portal preview** functionality from admin
8. **Bulk product import** from Excel

---

## 9. Dependencies

### Technical Dependencies
- [ ] Database schema changes for new entities
- [ ] No new NuGet packages required (uses existing Kendo UI)

### External Dependencies
- [ ] Product data from Medilock Benefits Brochure
- [ ] Portal mockups for understanding display requirements

### Blocked By
- [ ] None - can proceed independently

---

## 10. Open Questions

| # | Question | Owner | Status | Answer |
|---|----------|-------|--------|--------|
| 1 | Should pricing be stored as rate per $1000 sum assured or as flat amounts? | Product Team | Open | |
| 2 | How should we handle pricing for products with different calculation methods (e.g., per member vs per $1000 SA)? | Product Team | Open | |
| 3 | Should there be an approval workflow before products go live? | Product Team | Open | |
| 4 | Do we need to support different pricing by occupation class for GPA? | Product Team | Open | |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-08 | Claude Code | Initial draft based on SME Portal mockups and Medilock brochure |

---

## Appendix

### Related Documents
- SME Portal - Concept & Mock-ups (3 Dec 2025).pdf
- Medilock Benefits Brochure.pdf

### Glossary
| Term | Definition |
|------|------------|
| GTL | Group Term Life |
| GPA | Group Personal Accident |
| GHS | Group Hospital & Surgical |
| GMM | Group Major Medical |
| CI | Critical Illness |
| SME | Small and Medium Enterprises |
| NEL | No-Evidence Limit (underwriting) |
| TPD | Total & Permanent Disability |

### Product Mapping (Singapore)

| Product Code | Product Name | Category | Insurer | Default Rec |
|--------------|--------------|----------|---------|-------------|
| GTL | Group Term Life | Life & Protection | AIA | Yes |
| GPA | Group Personal Accident | Life & Protection | Chubb | Yes |
| CI | Critical Illness | Life & Protection | AIA | No |
| DI | Disability Income | Life & Protection | AIA | No |
| GHS | Group Hospital & Surgical | Medical | AIA | Yes |
| GP | General Practitioner (Outpatient Clinical) | Medical | AIA | Yes |
| SP | Outpatient Specialist | Medical | AIA | Yes |
| GMM | Group Major Medical | Medical | AIA | No |
| MAT | Maternity | Medical | AIA | No |
| DEN | Dental | Medical | AIA | No |
| MH | Mental Wellbeing | Medical | AIA | No |
| TRV | Travel Accident | Additional | Chubb | No |
| WICA | Work Injury Compensation | Additional | AIA | No |

### Product Dependencies

| Product | Requires |
|---------|----------|
| CI (Critical Illness) | GTL (Group Term Life) |
| DI (Disability Income) | GTL (Group Term Life) |
| GP (General Practitioner) | GHS (Hospital & Surgical) |
| SP (Outpatient Specialist) | GHS + GP |
| GMM (Major Medical) | GHS |
| MAT (Maternity) | GHS |
| DEN (Dental) | GHS |
| MH (Mental Wellbeing) | GHS |

---

*Template Version: 1.0*
*For use with BenefitNetFlex.Sample project*
