# CLAUDE.md - BenefitNetFlex.Sample Project Guide

## Project Overview

BenefitNetFlex.Sample is an **ASP.NET MVC 5 scaffold project** designed for rapid MVP development. It provides sample implementations of common enterprise UI patterns including dashboards, data grids, forms, and real-time notifications. This project serves as a starting template for building employee benefits management applications.

## Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Framework** | ASP.NET MVC | 5.2.7 |
| **Runtime** | .NET Framework | 4.6.2 |
| **Authentication** | Forms Authentication | (OWIN) |
| **Real-time** | SignalR | 2.4.3 |
| **UI Framework** | Bootstrap (Inspinia Theme) | 3.4.1 |
| **Rich Components** | Kendo UI | 2019.1.220 |
| **Client MVVM** | Knockout.js | 3.5.1 |
| **JavaScript** | jQuery | 3.6.1 |
| **Validation** | jQuery Validate + Unobtrusive | 1.19.5 |
| **JSON** | Newtonsoft.Json | 13.0.1 |
| **Icons** | Font Awesome | 4.x |

## Project Structure

```
BenefitNetFlex.Sample/
├── App_Start/                    # MVC Configuration
│   ├── BundleConfig.cs          # Script/style bundles (30 bundles)
│   ├── FilterConfig.cs          # Global error handling
│   └── RouteConfig.cs           # URL routing
├── Controllers/                  # MVC Controllers
│   ├── BaseController.cs        # ★ Base class - all controllers inherit this
│   ├── AccountController.cs     # Authentication
│   ├── DashboardController.cs   # Dashboard views
│   ├── HomeController.cs        # Home/landing pages
│   ├── ClientController.cs      # Client management
│   ├── SampleListController.cs  # Grid examples
│   ├── SampleFormController.cs  # Form examples
│   └── UserController.cs        # User management
├── Models/                       # ViewModels
│   ├── DashboardViewModel.cs
│   ├── ListViewModel.cs
│   ├── SampleFormViewModel.cs
│   ├── ClientDetailsModel.cs
│   └── LoginModel.cs
├── Views/                        # Razor Views
│   ├── Shared/                  # Layouts & Partials
│   │   ├── _MainLayout.cshtml   # ★ Master layout
│   │   ├── _Menu.cshtml         # Sidebar navigation
│   │   └── _TopNavbar.cshtml    # Top navigation bar
│   ├── Account/
│   ├── Dashboard/
│   ├── Client/
│   └── [Controller]/
├── Content/                      # Static Assets
│   ├── custom/                  # Custom CSS
│   ├── libraries/kendo/         # Kendo UI styles
│   └── fonts/                   # Web fonts
├── Scripts/                      # JavaScript
│   ├── custom/                  # Application modules
│   │   ├── common/bnetflex.js   # ★ Core utilities
│   │   └── [feature]/           # Feature modules
│   ├── libraries/               # Third-party libs
│   └── plugins/                 # jQuery plugins
├── Hubs/                        # SignalR Hubs
│   └── SystemNotificationHub.cs
├── Global.asax.cs               # Application startup
├── Startup.cs                   # OWIN startup
└── Web.config                   # Configuration
```

## Coding Conventions

### Controller Conventions

```csharp
// ★ PATTERN: All controllers inherit from BaseController
public class ClientController : BaseController
{
    // GET - Display view with ViewBag setup
    public ActionResult Clients()
    {
        ViewBag.Header = "Clients";           // Page title
        ViewBag.Countries = GetCountries();   // Dropdown data
        return View();
    }

    // POST - Grid data with server-side paging
    [HttpPost]
    public ActionResult SearchClientsAsync(string name, int page = 1, int pageSize = 10, int skip = 0, int take = 10)
    {
        var query = SampleClients.AsQueryable();

        // Apply filters
        if (!string.IsNullOrWhiteSpace(name))
            query = query.Where(c => c.Name.Contains(name));

        var total = query.Count();
        var data = query.Skip(skip).Take(take).ToList();

        // ★ PATTERN: Kendo Grid response format
        return Json(new { Data = data, Total = total });
    }

    // POST - Form submission with validation
    [HttpPost]
    [ValidateAntiForgeryToken]
    public ActionResult Create(ClientModel model)
    {
        if (!ModelState.IsValid)
            return View(model);

        // Save logic
        SetAlert("Client created successfully", "success");
        return RedirectToAction("Clients");
    }
}
```

### Model/ViewModel Conventions

```csharp
// ★ PATTERN: Use Data Annotations for validation
public class ClientDetailsModel
{
    public int ClientId { get; set; }

    [Required(ErrorMessage = "Client name is required")]
    [StringLength(200)]
    [Display(Name = "Client Name")]
    public string Name { get; set; }

    public string ClientType { get; set; }
    public int TotalMembersCount { get; set; }
    public int ActivePrincipalsCount { get; set; }
    public int PoliciesCount { get; set; }
    public bool IsLost { get; set; }

    // For grid link generation
    public string QueryString { get; set; }
}
```

### View Conventions

```html
@{
    Layout = "~/Views/Shared/_MainLayout.cshtml";
    ViewBag.Header = "Page Title";
}

<!-- ★ PATTERN: Use ibox for content sections -->
<div class="ibox float-e-margins">
    <div class="ibox-title">
        <h5>Section Title</h5>
    </div>
    <div class="ibox-content">
        <!-- Content here -->
    </div>
</div>

<!-- ★ PATTERN: Kendo Grid initialization -->
<div id="GridName"></div>

@section Scripts {
<script>
    $(document).ready(function() {
        $("#GridName").kendoGrid({
            dataSource: {
                transport: {
                    read: {
                        url: "@Url.Action("SearchAsync", "Controller")",
                        type: "POST",
                        dataType: "json"
                    }
                },
                schema: { data: "Data", total: "Total" },
                pageSize: 10,
                serverPaging: true
            },
            pageable: true,
            columns: [
                { field: "Name", title: "Name", width: 200 },
                { field: "Status", title: "Status", width: 100 }
            ]
        });
    });
</script>
}
```

## Naming Standards

| Element | Convention | Example |
|---------|------------|---------|
| **Controllers** | `[Feature]Controller` | `ClientController`, `DashboardController` |
| **ViewModels** | `[Feature]ViewModel` or `[Feature]Model` | `ClientDetailsModel`, `DashboardViewModel` |
| **Views** | `[ActionName].cshtml` | `Clients.cshtml`, `Details.cshtml` |
| **Partials** | `_[Name].cshtml` | `_Menu.cshtml`, `_TopNavbar.cshtml` |
| **JS Modules** | `[feature].js` | `bnetflex.js`, `search.js` |
| **CSS Files** | `[feature].css` | `motornet.css`, `site.css` |
| **Grid IDs** | PascalCase, matches entity | `#Clients`, `#Members` |

## Architectural Patterns

### 1. Base Controller Pattern
All controllers inherit from `BaseController` which provides:
- User context in `OnActionExecuting()`
- `JsonResponse()` helper for AJAX responses
- `SetAlert()` for TempData messages
- Global exception handling in `OnException()`

### 2. Kendo Grid Data Pattern
```csharp
// Request comes with: page, pageSize, skip, take
// Response format:
return Json(new {
    Data = pagedResults,    // List of items
    Total = totalCount      // Total record count
});
```

### 3. Form Validation Pattern
- Server: Data Annotations + `ModelState.IsValid`
- Client: jQuery Validate Unobtrusive (automatic)
- Custom: `IValidatableObject` for complex rules

### 4. SignalR Real-time Pattern
```csharp
// Hub: Hubs/SystemNotificationHub.cs
public class SystemNotificationHub : Hub
{
    public void SendNotification(string message)
    {
        Clients.All.receiveNotification(message);
    }
}
```

## API Response Formats

### Grid Data Response
```json
{
    "Data": [
        { "ClientId": 1, "Name": "Client 001", "Type": "Corporate" }
    ],
    "Total": 50
}
```

### Success/Error Response
```json
{
    "Success": true,
    "Message": "Operation completed",
    "Data": { }
}
```

## Common Commands

```bash
# Build the solution
msbuild BenefitNetFlex.Sample.sln /p:Configuration=Debug

# Restore NuGet packages
nuget restore BenefitNetFlex.Sample.sln

# Run the application (via IIS Express or Visual Studio)
# Press F5 in Visual Studio or use dotnet run equivalent

# Test credentials (for AccountController)
# admin / admin123
# user1 / password1
# demo / demo123
```

## What NOT To Do

### Anti-Patterns to Avoid

1. **Don't skip BaseController inheritance**
   ```csharp
   // BAD
   public class MyController : Controller { }

   // GOOD
   public class MyController : BaseController { }
   ```

2. **Don't return raw data without the Kendo wrapper**
   ```csharp
   // BAD - Kendo Grid won't paginate
   return Json(data);

   // GOOD
   return Json(new { Data = data, Total = total });
   ```

3. **Don't use inline styles - use Inspinia utility classes**
   ```html
   <!-- BAD -->
   <div style="margin-top: 20px;">

   <!-- GOOD -->
   <div class="m-t-md">
   ```

4. **Don't create loose JavaScript - use the module pattern**
   ```javascript
   // BAD
   function doSomething() { }

   // GOOD
   var MyModule = (function($) {
       return { doSomething: doSomething };
       function doSomething() { }
   })(jQuery);
   ```

5. **Don't hardcode URLs in JavaScript**
   ```javascript
   // BAD
   url: "/Client/Search"

   // GOOD
   url: "@Url.Action("Search", "Client")"
   ```

6. **Don't forget ViewBag.Header for page titles**
   ```csharp
   // Always set in controller actions
   ViewBag.Header = "Page Title";
   ```

## Instructions for Product Owners

### Requesting New Features

1. **Create a PRD** using the template in `docs/PRD-TEMPLATE.md`
2. **Include user stories** with acceptance criteria (Given/When/Then)
3. **Reference existing patterns** - point to similar features in the codebase
4. **Specify data fields** needed for any new entities

### Using Claude Code Commands

```
/create-prd          # Interactive PRD creation
/generate-mvp        # Generate code from PRD
/create-spec         # Create technical specification
/validate-feature    # Validate code against standards
```

### Best Practices

- Start with the simplest version of a feature
- Reference the Clients page (`Views/Client/Clients.cshtml`) as a grid example
- Reference the Dashboard (`Views/Dashboard/Index.cshtml`) for widget layouts
- Always specify which existing feature is most similar to what you want

## Reference Files for Key Patterns

| Pattern | Reference File |
|---------|---------------|
| **Grid with Search** | `Views/Client/Clients.cshtml` |
| **Controller with AJAX** | `Controllers/ClientController.cs` |
| **Base Controller** | `Controllers/BaseController.cs` |
| **Layout Structure** | `Views/Shared/_MainLayout.cshtml` |
| **Navigation Menu** | `Views/Shared/_Menu.cshtml` |
| **ViewModel** | `Models/ClientDetailsModel.cs` |
| **Bundle Config** | `App_Start/BundleConfig.cs` |
| **Core JS Utilities** | `Scripts/custom/common/bnetflex.js` |

## CSS Classes Quick Reference

### Layout
- `.ibox` - Content box container
- `.ibox-title` - Box header
- `.ibox-content` - Box body
- `.tabs-container` - Tab wrapper
- `.panel` - Panel container

### Spacing
- `.m-t-md`, `.m-b-md` - Margin top/bottom medium
- `.m-t-lg`, `.m-b-lg` - Margin top/bottom large
- `.p-md`, `.p-lg` - Padding medium/large

### Colors
- `.navy-bg` - Navy background (#1AB394)
- `.lazur-bg` - Light blue background
- `.color-green` - Green text (#1ab394)
- `.color-red` - Red text (#ed5565)
- `.text-navy` - Navy text

### Buttons
- `.btn-primary` - Primary action (navy)
- `.btn-success` - Success action
- `.btn-default` - Secondary action
- `.btn-w-m` - Medium width button

---

*Last updated: 2026-01-02*
*For questions, see the reference BenefitNetFlex project or contact the development team.*
