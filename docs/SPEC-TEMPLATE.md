# Technical Specification

## Metadata

| Field | Value |
|-------|-------|
| **Feature Name** | [Feature Name] |
| **PRD Reference** | [Link to PRD-{feature}.md] |
| **Author** | [Developer Name] |
| **Created** | [Date] |
| **Status** | Draft / In Review / Approved |
| **Reviewers** | [Names] |

---

## 1. Overview

### Summary
[2-3 sentence summary of what will be built technically.]

### Goals
- [Technical goal 1]
- [Technical goal 2]

### Non-Goals
- [What this spec explicitly does NOT cover]

---

## 2. Technical Approach

### Architecture Decision
[Describe the chosen approach and why.]

**Option Considered:**
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Option A | [Pros] | [Cons] | Selected / Rejected |
| Option B | [Pros] | [Cons] | Selected / Rejected |

### Components Affected
- [ ] **Controller:** [ControllerName]Controller.cs
- [ ] **Model:** [ModelName]ViewModel.cs
- [ ] **View:** Views/[Controller]/[Action].cshtml
- [ ] **JavaScript:** Scripts/custom/[feature]/[file].js
- [ ] **CSS:** Content/custom/[file].css
- [ ] **Routes:** App_Start/RouteConfig.cs
- [ ] **Bundles:** App_Start/BundleConfig.cs

---

## 3. Data Model

### New Models

```csharp
// Models/[Feature]ViewModel.cs
public class [Feature]ViewModel
{
    public int Id { get; set; }

    [Required(ErrorMessage = "[Field] is required")]
    [StringLength(200)]
    [Display(Name = "[Display Name]")]
    public string Name { get; set; }

    [Display(Name = "[Display Name]")]
    public string Description { get; set; }

    public DateTime CreatedDate { get; set; }
    public bool IsActive { get; set; }

    // Navigation/related data
    public List<RelatedItem> Items { get; set; }

    public [Feature]ViewModel()
    {
        Items = new List<RelatedItem>();
        CreatedDate = DateTime.Now;
        IsActive = true;
    }
}
```

### Model Relationships
```
[Entity A] 1 ──── * [Entity B]
                    │
                    └── * [Entity C]
```

### Validation Rules
| Field | Validation | Error Message |
|-------|------------|---------------|
| Name | Required, MaxLength(200) | "Name is required" |
| Email | EmailAddress | "Invalid email format" |
| Amount | Range(0, 999999) | "Amount must be between 0 and 999999" |

---

## 4. API Endpoints

### Controller Actions

#### GET: /[Controller]/[Action]
**Purpose:** Display the main view

```csharp
public ActionResult [Action]()
{
    ViewBag.Header = "[Page Title]";
    ViewBag.DropdownData = GetDropdownData();
    return View();
}
```

#### POST: /[Controller]/Search[Entity]Async
**Purpose:** Server-side grid data with paging

**Request Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | No | Filter by name |
| status | int? | No | Filter by status |
| page | int | Yes | Current page (1-based) |
| pageSize | int | Yes | Items per page |
| skip | int | Yes | Items to skip |
| take | int | Yes | Items to take |

**Response Format:**
```json
{
    "Data": [
        {
            "Id": 1,
            "Name": "Example",
            "Status": "Active",
            "CreatedDate": "2024-01-15T00:00:00"
        }
    ],
    "Total": 100
}
```

```csharp
[HttpPost]
public ActionResult Search[Entity]Async(string name, int? status,
    int page = 1, int pageSize = 10, int skip = 0, int take = 10)
{
    var query = GetData().AsQueryable();

    // Apply filters
    if (!string.IsNullOrWhiteSpace(name))
        query = query.Where(x => x.Name.Contains(name));

    if (status.HasValue)
        query = query.Where(x => x.StatusId == status.Value);

    var total = query.Count();
    var data = query.Skip(skip).Take(take).ToList();

    return Json(new { Data = data, Total = total });
}
```

#### POST: /[Controller]/Create
**Purpose:** Create new entity

**Request:** Form POST with model binding + AntiForgeryToken

**Response:** Redirect to list on success, View with errors on failure

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult Create([Feature]ViewModel model)
{
    if (!ModelState.IsValid)
        return View(model);

    // Save logic here

    SetAlert("Record created successfully", "success");
    return RedirectToAction("Index");
}
```

#### GET: /[Controller]/Details/{id}
**Purpose:** View entity details

```csharp
public ActionResult Details(int? id)
{
    if (!id.HasValue)
        return RedirectToAction("Index");

    var entity = GetById(id.Value);
    if (entity == null)
        return HttpNotFound();

    ViewBag.Header = entity.Name;
    return View(entity);
}
```

---

## 5. UI Components

### View: Views/[Controller]/[Action].cshtml

```html
@{
    Layout = "~/Views/Shared/_MainLayout.cshtml";
    ViewBag.Header = "[Page Title]";
}

<div class="tabs-container">
    <ul class="nav nav-tabs">
        <li class="active">
            <a data-toggle="tab" href="#tab-main">Main</a>
        </li>
    </ul>
    <div class="tab-content">
        <div id="tab-main" class="tab-pane active">
            <div class="panel-body">
                <div class="ibox float-e-margins">
                    <div class="ibox-content">
                        <!-- Search Panel -->
                        <div class="panel panel-default">
                            <div class="panel-heading">
                                <h5 class="panel-title">
                                    <a data-toggle="collapse" href="#searchPanel">
                                        <i class="fa fa-search"></i> Search
                                    </a>
                                </h5>
                            </div>
                            <div id="searchPanel" class="panel-collapse collapse">
                                <div class="panel-body">
                                    <!-- Search fields -->
                                </div>
                            </div>
                        </div>

                        <!-- Grid -->
                        <div id="[GridId]" style="margin-bottom: 10px"></div>

                        <!-- Action Buttons -->
                        <a href="@Url.Action("Add")" class="btn btn-primary">
                            <i class="fa fa-plus"></i> Add New
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

@section Scripts {
<script>
    $(document).ready(function() {
        initializeGrid();
    });

    function initializeGrid() {
        $("#[GridId]").kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        url: "@Url.Action("Search[Entity]Async")",
                        type: "POST",
                        dataType: "json",
                        data: getSearchParams
                    }
                },
                schema: {
                    data: "Data",
                    total: "Total"
                },
                pageSize: 10,
                serverPaging: true,
                serverFiltering: true
            },
            scrollable: { height: 456 },
            pageable: true,
            columns: [
                { field: "Name", title: "Name", width: 200 },
                { field: "Status", title: "Status", width: 100 },
                {
                    title: "Actions",
                    width: 100,
                    template: "<a href='@Url.Action("Details")#=QueryString#'>View</a>"
                }
            ]
        });
    }

    function getSearchParams() {
        return {
            name: $("#searchName").val(),
            status: $("#searchStatus").val()
        };
    }

    function search() {
        $("#[GridId]").data("kendoGrid").dataSource.page(1);
    }

    function resetFilter() {
        $("#searchName").val("");
        $("#searchStatus").val("");
        search();
    }
</script>
}
```

### CSS Additions (if needed)

```css
/* Content/custom/[feature].css */

/* Add to BundleConfig.cs if creating new file */
#[GridId] .custom-column {
    /* Column-specific styling */
}

/* Use existing Inspinia utility classes where possible:
   .m-t-md, .m-b-md, .p-lg, .ibox, .color-green, .color-red */
```

---

## 6. Security Considerations

### Authentication
- [ ] All actions require `[Authorize]` (inherited from BaseController)
- [ ] Specific role required: [Role name or N/A]

### Authorization
- [ ] User can only access their own data
- [ ] Admin can access all data
- [ ] No special authorization required

### Input Validation
- [ ] Server-side validation via Data Annotations
- [ ] Client-side validation via jQuery Validate Unobtrusive
- [ ] Anti-forgery tokens on all POST forms

### Data Protection
- [ ] Sensitive data encrypted: [Fields or N/A]
- [ ] PII handling: [Approach or N/A]

---

## 7. Testing Approach

### Manual Testing Scenarios

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| View grid | 1. Navigate to page | Grid displays with data |
| Search | 1. Enter filter 2. Click Search | Grid shows filtered results |
| Pagination | 1. Click page 2 | Second page of results shown |
| Create | 1. Click Add 2. Fill form 3. Submit | Record created, redirected to list |
| Validation | 1. Submit empty form | Validation errors displayed |

### Test Data
```csharp
// Add to controller for demo purposes
private static List<[Entity]> GenerateSampleData()
{
    return new List<[Entity]>
    {
        new [Entity] { Id = 1, Name = "Sample 1", Status = "Active" },
        new [Entity] { Id = 2, Name = "Sample 2", Status = "Inactive" }
    };
}
```

---

## 8. Rollout Plan

### Phase 1: Development
- [ ] Create model/viewmodel
- [ ] Create controller with actions
- [ ] Create views
- [ ] Add to navigation menu

### Phase 2: Testing
- [ ] Manual testing of all scenarios
- [ ] Cross-browser testing (Chrome, Firefox, Edge)
- [ ] Review with PO

### Phase 3: Release
- [ ] Code review completed
- [ ] Merged to main branch
- [ ] Deployed to staging
- [ ] Final PO sign-off
- [ ] Production deployment

---

## 9. Open Issues & Risks

| Issue | Impact | Mitigation |
|-------|--------|------------|
| [Issue description] | [High/Medium/Low] | [How to address] |

---

## 10. References

### Related Files
- **Similar Feature:** `Views/Client/Clients.cshtml`
- **Controller Pattern:** `Controllers/ClientController.cs`
- **Model Pattern:** `Models/ClientDetailsModel.cs`

### Documentation
- [CLAUDE.md](../CLAUDE.md) - Project conventions
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) - UI components

---

*Template Version: 1.0*
*For use with BenefitNetFlex.Sample project*
