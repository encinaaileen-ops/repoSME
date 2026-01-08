# BenefitNetFlex Sample UI Project

## Purpose
This is a lightweight sample project extracted from the BenefitNetFlex application, designed for rapid prototyping and module development using Claude Code. It contains all the UI structure, layouts, styles, and patterns from the main application but without business logic or database dependencies.

## Quick Start

### Prerequisites
- Visual Studio 2019 or later
- .NET Framework 4.6.2
- IIS Express

### Running the Project
1. Open `BenefitNetFlex.Sample.csproj` in Visual Studio
2. Build the solution (Ctrl+Shift+B)
3. Press F5 to run with debugging
4. The application will open in your default browser at https://localhost:44300

### Alternative: Command Line
```bash
# Build
msbuild BenefitNetFlex.Sample.csproj

# Run with IIS Express
iisexpress /path:D:\TEAMBASE\ScaffoldBenefitNet\BenefitNetFlex.Sample /port:44300
```

## Project Structure

```
BenefitNetFlex.Sample/
│
├── App_Start/              # MVC Configuration
│   ├── BundleConfig.cs     # Script and style bundles
│   ├── FilterConfig.cs     # Global filters
│   └── RouteConfig.cs      # URL routing
│
├── Controllers/            # Sample controllers
│   ├── BaseController.cs   # Base controller with common functionality
│   ├── DashboardController.cs # Dashboard with widgets
│   ├── SampleListController.cs # List with Kendo Grid
│   ├── SampleFormController.cs # Forms with validation
│   └── SampleDetailController.cs # Detail views with tabs
│
├── Models/                 # View models
│   ├── DashboardViewModel.cs
│   ├── ListViewModel.cs
│   ├── SampleFormViewModel.cs
│   └── DetailViewModel.cs
│
├── Views/                  # Razor views
│   ├── Shared/            # Layouts and partials
│   │   ├── _MainLayout.cshtml
│   │   ├── _Menu.cshtml
│   │   └── _TopNavbar.cshtml
│   ├── Dashboard/         # Dashboard views
│   ├── SampleList/        # List views
│   ├── SampleForm/        # Form views
│   └── SampleDetail/      # Detail views
│
├── Content/               # CSS and static assets
│   ├── inspinia-upgrade/  # Inspinia admin theme
│   ├── plugins/          # Third-party CSS
│   └── *.css            # Custom styles
│
├── Scripts/              # JavaScript files
│   ├── app/             # Application scripts
│   ├── custom/          # Custom scripts
│   ├── plugins/         # Third-party plugins
│   └── jquery*.js       # jQuery libraries
│
└── Areas/               # MVC Areas (if applicable)
```

## Sample Modules

### 1. Dashboard (`/Dashboard`)
- Card-based statistics
- Charts and graphs
- Activity feed
- Widget refresh capability

### 2. List View (`/SampleList`)
- Kendo Grid with server-side paging
- Filtering and sorting
- Bulk operations
- Export functionality

### 3. Forms (`/SampleForm/Create`)
- Client and server-side validation
- Various input types
- File upload
- Multi-step wizard

### 4. Detail View (`/SampleDetail/Details/{id}`)
- Tabbed interface
- Inline editing
- Document attachments
- Activity timeline
- Notes and comments

## Key Technologies

- **ASP.NET MVC 5** - Web framework
- **Razor** - View engine
- **.NET Framework 4.6.2** - Runtime
- **Inspinia** - Admin theme (Bootstrap 3 based)
- **Kendo UI** - Rich UI components
- **jQuery 3.6.1** - JavaScript library
- **Knockout.js** - MVVM binding
- **SignalR** - Real-time communication

## Common Patterns

### Controller Pattern
```csharp
public class SampleController : BaseController
{
    public ActionResult Index()
    {
        ViewBag.Header = "Page Title";
        var model = GetData();
        return View(model);
    }
}
```

### AJAX Endpoints
```csharp
[HttpPost]
public JsonResult GetData(RequestModel request)
{
    var data = ProcessRequest(request);
    return JsonResponse(data, true, "Success");
}
```

### Form Validation
```csharp
[Required(ErrorMessage = "Field is required")]
[StringLength(100)]
public string FieldName { get; set; }
```

## Mock Data
All data in this project is mocked using in-memory collections. Controllers contain static lists and helper methods that generate sample data. This allows the UI to function without any database or external dependencies.

## Customization Tips

1. **Adding a New Module**:
   - Create a controller inheriting from `BaseController`
   - Add corresponding views in `/Views/[ControllerName]/`
   - Use existing layouts and partials

2. **Modifying Styles**:
   - Custom styles in `/Content/Site.css`
   - Theme overrides in `/Content/style.css`
   - Component-specific styles in respective CSS files

3. **Adding JavaScript**:
   - Module-specific scripts in `/Scripts/custom/[module]/`
   - Register in BundleConfig for optimization

## Using with Claude Code

When creating new modules with Claude Code, provide context like:
"Using the BenefitNetFlex.Sample project structure, create a new module for [feature] that follows the existing patterns for controllers, views, and models."

## Troubleshooting

### Build Errors
- Ensure all NuGet packages are restored
- Check that .NET Framework 4.6.2 is installed

### Missing Styles/Scripts
- Verify Inspinia theme files are in `/Content/inspinia-upgrade/`
- Check bundle configuration in `App_Start/BundleConfig.cs`

### Kendo UI License
- The project references Kendo UI which requires a license
- Replace with open-source alternatives if needed

## License
This sample project is for internal development use only. Inspinia and Kendo UI components require proper licensing for production use.