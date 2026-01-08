# Architecture Documentation

## System Overview

BenefitNetFlex.Sample is a **traditional ASP.NET MVC 5 web application** designed as a scaffold for building employee benefits management systems. It follows a simple layered architecture optimized for rapid MVP development.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT BROWSER                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   jQuery    │  │  Kendo UI   │  │ Knockout.js │  │   SignalR   │ │
│  │   3.6.1     │  │  2019.1.220 │  │    3.5.1    │  │   Client    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/HTTPS + WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ASP.NET MVC 5 APPLICATION                     │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                       │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │   │
│  │  │    Views       │  │   Layouts      │  │   Partials     │  │   │
│  │  │  (*.cshtml)    │  │ (_MainLayout)  │  │  (_Menu, etc)  │  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      CONTROLLER LAYER                         │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │                    BaseController                       │  │   │
│  │  │  - OnActionExecuting (user context)                     │  │   │
│  │  │  - JsonResponse (standardized responses)                │  │   │
│  │  │  - SetAlert (TempData messages)                        │  │   │
│  │  │  - OnException (global error handling)                  │  │   │
│  │  └─────────────────────────┬──────────────────────────────┘  │   │
│  │                            │ Inherits                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │   │
│  │  │ Account │ │Dashboard│ │ Client  │ │  Home   │ │  User   │ │   │
│  │  │Controller│Controller│Controller│Controller│Controller│ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                       MODEL LAYER                             │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  │   │
│  │  │   ViewModels   │  │  Data Models   │  │   Validation   │  │   │
│  │  │ (strongly-typed│  │ (entity DTOs)  │  │ (DataAnnot.)   │  │   │
│  │  │  view binding) │  │                │  │                │  │   │
│  │  └────────────────┘  └────────────────┘  └────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                │                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                     SIGNALR HUB LAYER                         │   │
│  │  ┌────────────────────────────────────────────────────────┐  │   │
│  │  │              SystemNotificationHub                      │  │   │
│  │  │  - Real-time push notifications                        │  │   │
│  │  │  - User group management                               │  │   │
│  │  │  - Persistent connection handling                      │  │   │
│  │  └────────────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                      CONFIGURATION                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │   │
│  │  │ Bundles  │  │  Routes  │  │ Filters  │  │Web.config│     │   │
│  │  │ (30 def) │  │ (4 custom│  │(HandleErr│  │(Auth,Sess│     │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                   Mock Data (In-Memory)                       │   │
│  │  - Static collections in controllers                         │   │
│  │  - GenerateSampleData() methods                              │   │
│  │  - No database (scaffold/prototype mode)                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  [TODO: For production, add:]                                       │
│  - Entity Framework DbContext                                       │
│  - Repository pattern                                               │
│  - Unit of Work                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Presentation Layer (Views)

**Location:** `/Views/`

**Responsibilities:**
- Render HTML using Razor syntax
- Display data from ViewModels
- Client-side interactivity via JavaScript

**Key Components:**
| Component | Location | Purpose |
|-----------|----------|---------|
| `_MainLayout.cshtml` | `Views/Shared/` | Master page layout |
| `_Menu.cshtml` | `Views/Shared/` | Sidebar navigation |
| `_TopNavbar.cshtml` | `Views/Shared/` | Top navigation bar |
| Feature Views | `Views/[Controller]/` | Feature-specific pages |

**Conventions:**
- All views use `_MainLayout.cshtml` as Layout
- Set `ViewBag.Header` for page title
- Use `@section Scripts` for page-specific JavaScript
- Follow Inspinia theme patterns (ibox, tabs-container, etc.)

### 2. Controller Layer

**Location:** `/Controllers/`

**Responsibilities:**
- Handle HTTP requests
- Coordinate between views and models
- Return appropriate responses (View, JSON, Redirect)
- Apply authorization

**Base Controller Features:**
```csharp
public class BaseController : Controller
{
    // Runs before every action - sets up user context
    protected override void OnActionExecuting(ActionExecutingContext filterContext)

    // Standardized JSON response wrapper
    protected JsonResult JsonResponse(bool success, string message, object data = null)

    // Set alert message for next request (TempData)
    protected void SetAlert(string message, string type)

    // Global exception handling
    protected override void OnException(ExceptionContext filterContext)
}
```

**Request/Response Patterns:**

| Action Type | Returns | Use Case |
|-------------|---------|----------|
| Display View | `View()` | Page rendering |
| Grid Data | `Json(new { Data, Total })` | Kendo Grid server-side |
| Form Submit | `RedirectToAction()` or `View()` | Create/Edit operations |
| AJAX Operation | `Json(new { Success, Message })` | Async operations |

### 3. Model Layer

**Location:** `/Models/`

**Responsibilities:**
- Define data structures (ViewModels)
- Implement validation rules (Data Annotations)
- Provide strongly-typed binding for views

**Naming Conventions:**
- `[Feature]ViewModel` - For page view models
- `[Feature]Model` - For data transfer objects
- Use Data Annotations for validation

**Example:**
```csharp
public class ClientDetailsModel
{
    public int ClientId { get; set; }

    [Required(ErrorMessage = "Name is required")]
    [StringLength(200)]
    [Display(Name = "Client Name")]
    public string Name { get; set; }

    public string QueryString { get; set; }  // For URL generation
}
```

### 4. SignalR Hub Layer

**Location:** `/Hubs/`

**Responsibilities:**
- Real-time bidirectional communication
- Push notifications to connected clients
- Manage user connection groups

**Available Hub:**
```csharp
public class SystemNotificationHub : Hub
{
    public void JoinGroup(string groupName);
    public void LeaveGroup(string groupName);
    public void SendNotification(string message);
}
```

**Client Callbacks:**
- `receiveNotification(message)` - Receive push notification
- `persistentLogOff()` - Force logout notification

### 5. Configuration Layer

**Location:** `/App_Start/`

| File | Purpose |
|------|---------|
| `BundleConfig.cs` | Define 30 script/style bundles |
| `RouteConfig.cs` | URL routing (4 custom + default) |
| `FilterConfig.cs` | Global filters (HandleError) |

## Data Flow

### Page Request Flow
```
Browser Request
     │
     ▼
┌─────────────┐
│   Routing   │ ──▶ RouteConfig.cs matches URL pattern
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │ ──▶ BaseController.OnActionExecuting()
│   Action    │     Controller action method executes
└─────────────┘
     │
     ▼
┌─────────────┐
│  ViewModel  │ ──▶ Data prepared, ViewBag set
└─────────────┘
     │
     ▼
┌─────────────┐
│    View     │ ──▶ Razor renders HTML
└─────────────┘
     │
     ▼
Browser Response (HTML + CSS + JS bundles)
```

### Grid Data Request Flow
```
Kendo Grid Request (POST)
     │
     ▼
┌─────────────────┐
│   Controller    │
│  SearchAsync()  │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  Query Data     │ ──▶ Filter, Sort, Page
└─────────────────┘
     │
     ▼
┌─────────────────┐
│  JSON Response  │ ──▶ { Data: [...], Total: n }
└─────────────────┘
     │
     ▼
Kendo Grid Updates (Client-side)
```

### Form Submission Flow
```
Form POST (with AntiForgeryToken)
     │
     ▼
┌─────────────────┐
│   Controller    │
│  [HttpPost]     │
└─────────────────┘
     │
     ▼
┌─────────────────┐     ┌─────────────────┐
│ ModelState.     │ No  │  Return View    │
│ IsValid?        │────▶│  with Errors    │
└─────────────────┘     └─────────────────┘
     │ Yes
     ▼
┌─────────────────┐
│  Save Data      │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ SetAlert()      │
│ RedirectToAction│
└─────────────────┘
```

## Key Dependencies

### NuGet Packages (68 total)

**Core Framework:**
- `Microsoft.AspNet.Mvc` 5.2.7
- `Microsoft.AspNet.Razor` 3.2.7
- `Microsoft.AspNet.WebPages` 3.2.7
- `Microsoft.Owin` 4.2.2
- `Microsoft.Owin.Host.SystemWeb` 4.2.2

**Real-time:**
- `Microsoft.AspNet.SignalR` 2.4.3
- `Microsoft.AspNet.SignalR.Core` 2.4.3
- `Microsoft.AspNet.SignalR.JS` 2.4.3

**Client Libraries (via CDN/local):**
- jQuery 3.6.1
- Bootstrap 3.4.1
- Kendo UI 2019.1.220
- Knockout.js 3.5.1

**Utilities:**
- `Newtonsoft.Json` 13.0.1
- `jQuery.Validation` 1.19.5
- `Microsoft.jQuery.Unobtrusive.Ajax` 3.2.6
- `Microsoft.jQuery.Unobtrusive.Validation` 3.2.12

## External Integrations

### Current (Scaffold Mode)
- **None** - All data is mocked in-memory

### Planned (Production Mode)
```
┌─────────────────┐
│  Application    │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│  SQL  │ │ APIs  │
│Server │ │(REST) │
└───────┘ └───────┘
```

## Security Architecture

### Authentication
```
┌─────────────────────────────────────────┐
│           Forms Authentication           │
│  ┌─────────────────────────────────────┐│
│  │  Web.config                         ││
│  │  - loginUrl="~/Account/Login"       ││
│  │  - timeout="30" (minutes)           ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │  AccountController                  ││
│  │  - Login (validate credentials)     ││
│  │  - LogOff (clear auth cookie)       ││
│  │  - FormsAuthentication.SetAuthCookie││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Authorization
- `[Authorize]` attribute on BaseController
- Anonymous paths: `/Account`, `/Content`, `/Scripts`, `/fonts`
- Role-based authorization: [TODO: Implement if needed]

### Input Validation
- Server: Data Annotations + `ModelState.IsValid`
- Client: jQuery Validate Unobtrusive (automatic)
- CSRF: `@Html.AntiForgeryToken()` + `[ValidateAntiForgeryToken]`

## Scalability Considerations

### Current Limitations (Scaffold Mode)
- In-memory data (not persistent)
- Single server deployment
- No caching layer
- No background job processing

### Production Recommendations
1. Add Entity Framework for data persistence
2. Implement Repository pattern for data access
3. Add Redis for distributed caching
4. Use Azure SignalR Service for scale-out
5. Implement proper logging (Serilog, etc.)

## Folder Structure Reference

```
BenefitNetFlex.Sample/
│
├── App_Start/              # Startup configuration
│   ├── BundleConfig.cs     # 30 bundles defined
│   ├── FilterConfig.cs     # HandleErrorAttribute
│   └── RouteConfig.cs      # 4 custom routes
│
├── Controllers/            # MVC Controllers
│   ├── BaseController.cs   # ★ Inherit from this
│   └── [Feature]Controller.cs
│
├── Models/                 # ViewModels
│   └── [Feature]ViewModel.cs
│
├── Views/                  # Razor Views
│   ├── Shared/            # Layouts, Partials
│   │   ├── _MainLayout.cshtml
│   │   ├── _Menu.cshtml
│   │   └── _TopNavbar.cshtml
│   └── [Controller]/      # Feature views
│
├── Content/               # Static CSS
│   ├── custom/           # Custom styles
│   ├── libraries/kendo/  # Kendo UI Nova theme
│   └── fonts/            # Web fonts
│
├── Scripts/               # JavaScript
│   ├── custom/           # App modules
│   │   ├── common/       # Shared utilities
│   │   └── [feature]/    # Feature modules
│   ├── libraries/        # Kendo UI, jQuery
│   └── plugins/          # Third-party
│
├── Hubs/                  # SignalR Hubs
│   └── SystemNotificationHub.cs
│
├── docs/                  # Documentation
│   ├── PRD-TEMPLATE.md
│   ├── SPEC-TEMPLATE.md
│   ├── ARCHITECTURE.md   # This file
│   └── DESIGN-SYSTEM.md
│
├── Global.asax.cs         # Application events
├── Startup.cs             # OWIN startup
├── Web.config             # Configuration
├── packages.config        # NuGet packages
└── CLAUDE.md              # AI assistant guide
```

---

*Last Updated: 2026-01-02*
