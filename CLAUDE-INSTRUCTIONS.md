# Claude Code Instructions for BenefitNetFlex Sample Project

## Overview
This document provides specific instructions and templates for using Claude Code to generate new modules and features in the BenefitNetFlex Sample project.

## Project Context
When working with this project, Claude Code should know:
- Framework: ASP.NET MVC 5 on .NET Framework 4.6.2
- UI Theme: Inspinia (Bootstrap 3 based)
- Key Libraries: jQuery 3.6.1, Kendo UI, Knockout.js, SignalR
- Architecture: MVC pattern with ViewModels
- All controllers inherit from BaseController

## Common Module Generation Templates

### 1. Generate a Complete CRUD Module

**Prompt Template:**
```
Using the BenefitNetFlex.Sample project structure, create a complete CRUD module for [EntityName] with the following:

1. Controller: [EntityName]Controller inheriting from BaseController
2. Views: Index (list with Kendo Grid), Create, Edit, Details
3. ViewModels: [EntityName]ViewModel, [EntityName]ListViewModel, [EntityName]FormViewModel
4. Include standard features:
   - Server-side paging and sorting
   - Form validation
   - AJAX operations
   - Success/error notifications

Use the existing patterns from SampleListController and SampleFormController as reference.
```

### 2. Generate a Dashboard Module

**Prompt Template:**
```
Create a dashboard module for [ModuleName] in the BenefitNetFlex.Sample project with:

1. Statistics cards showing [list specific metrics]
2. Charts using the existing charting pattern
3. Recent activity feed
4. Quick action buttons
5. Data refresh capabilities

Follow the pattern in DashboardController and use the Inspinia widget styles.
```

### 3. Generate a Report Module

**Prompt Template:**
```
Create a reporting module for [ReportName] with:

1. Filter panel with date range, dropdowns for [list filters]
2. Kendo Grid for results
3. Export to Excel/PDF functionality
4. Chart visualization of data
5. Print-friendly view

Use Bootstrap panels for the filter section and follow the existing grid patterns.
```

### 4. Generate a Multi-Step Form

**Prompt Template:**
```
Create a multi-step wizard form for [ProcessName] with [X] steps:

Step 1: [Description]
Step 2: [Description]
...

Include:
- Step progress indicator
- Validation per step
- Navigation between steps
- Save draft functionality
- Final submission

Follow the wizard pattern in SampleFormController.
```

## Code Generation Rules

### DO's:
1. ✅ Always inherit controllers from BaseController
2. ✅ Use ViewBag.Header for page titles
3. ✅ Use ViewBag.BreadCrumb for navigation
4. ✅ Return JsonResponse() for AJAX endpoints
5. ✅ Include AntiForgeryToken in forms
6. ✅ Use data annotations for validation
7. ✅ Follow existing naming conventions
8. ✅ Use existing CSS classes (Inspinia theme)
9. ✅ Include proper error handling
10. ✅ Add comments with // SAMPLE: or // PATTERN:

### DON'Ts:
1. ❌ Don't create new database contexts
2. ❌ Don't add Entity Framework code
3. ❌ Don't implement real authentication
4. ❌ Don't add external API calls
5. ❌ Don't create new CSS frameworks
6. ❌ Don't change the existing layout structure
7. ❌ Don't modify BaseController
8. ❌ Don't add new NuGet packages
9. ❌ Don't create business logic layers
10. ❌ Don't implement real data persistence

## File Placement

```
Controllers/
  └── [Feature]Controller.cs

Models/
  ├── [Feature]ViewModel.cs
  ├── [Feature]ListViewModel.cs
  └── [Feature]FormViewModel.cs

Views/
  └── [Feature]/
      ├── Index.cshtml
      ├── Create.cshtml
      ├── Edit.cshtml
      ├── Details.cshtml
      └── Partials/
          └── _[PartialName].cshtml

Scripts/custom/
  └── [feature]/
      └── [feature].js

Content/
  └── [feature].css (if needed)
```

## View Templates

### List View Structure
```html
@model ListViewModel

<div class="row wrapper border-bottom white-bg page-heading">
    <div class="col-lg-10">
        <h2>@ViewBag.Header</h2>
    </div>
    <div class="col-lg-2">
        <a href="@Url.Action("Create")" class="btn btn-primary">Add New</a>
    </div>
</div>

<div class="wrapper wrapper-content animated fadeInRight">
    <div class="row">
        <div class="col-lg-12">
            <div class="ibox float-e-margins">
                <div class="ibox-content">
                    @(Html.Kendo().Grid<Model>()...)
                </div>
            </div>
        </div>
    </div>
</div>
```

### Form View Structure
```html
@model FormViewModel

<div class="row wrapper border-bottom white-bg page-heading">
    <div class="col-lg-10">
        <h2>@ViewBag.Header</h2>
    </div>
</div>

<div class="wrapper wrapper-content animated fadeInRight">
    <div class="row">
        <div class="col-lg-12">
            <div class="ibox float-e-margins">
                <div class="ibox-content">
                    @using (Html.BeginForm())
                    {
                        @Html.AntiForgeryToken()
                        <!-- Form fields -->
                    }
                </div>
            </div>
        </div>
    </div>
</div>
```

## Controller Patterns

### Standard AJAX Endpoint
```csharp
[HttpPost]
public JsonResult ActionName(RequestModel model)
{
    try
    {
        // Validation
        if (!ModelState.IsValid)
        {
            return JsonResponse(null, false, "Invalid data");
        }

        // Process
        var result = ProcessData(model);

        // Return
        return JsonResponse(result, true, "Success message");
    }
    catch (Exception ex)
    {
        return JsonResponse(null, false, "Error message");
    }
}
```

### Kendo Grid Data Source
```csharp
[HttpPost]
public JsonResult GetGridData(GridRequest request)
{
    var query = GetData().AsQueryable();

    // Apply filters
    if (!string.IsNullOrEmpty(request.SearchTerm))
    {
        query = query.Where(x => x.Name.Contains(request.SearchTerm));
    }

    var total = query.Count();

    // Apply paging
    var data = query
        .Skip((request.Page - 1) * request.PageSize)
        .Take(request.PageSize)
        .ToList();

    return Json(new { Data = data, Total = total });
}
```

## JavaScript Patterns

### AJAX Call Template
```javascript
function performAction(data) {
    $.ajax({
        url: '/Controller/Action',
        type: 'POST',
        data: JSON.stringify(data),
        contentType: 'application/json',
        beforeSend: function() {
            showLoading();
        },
        success: function(result) {
            if (result.success) {
                swal('Success', result.message, 'success');
                // Additional success handling
            } else {
                swal('Error', result.message, 'error');
            }
        },
        error: function() {
            swal('Error', 'An error occurred', 'error');
        },
        complete: function() {
            hideLoading();
        }
    });
}
```

## Testing the Generated Code

After generating a new module, verify:
1. ✅ Project builds without errors
2. ✅ Routes work correctly
3. ✅ Views render properly
4. ✅ Form validation works (client and server)
5. ✅ AJAX endpoints return proper JSON
6. ✅ Kendo Grid loads and paginates
7. ✅ Styles are applied correctly
8. ✅ JavaScript functions work
9. ✅ Error handling works
10. ✅ Mock data is generated properly

## Example Generation Prompts

### Simple List Module
```
Generate a Member List module with:
- Kendo Grid showing: Name, Email, Phone, Status, JoinDate
- Filters for Status and JoinDate range
- Bulk activate/deactivate actions
- Export to Excel
```

### Complex Form Module
```
Generate a Policy Creation form with:
- Step 1: Policy holder information (name, DOB, contact)
- Step 2: Coverage selection (checkboxes for coverage types)
- Step 3: Beneficiaries (dynamic add/remove)
- Step 4: Review and submit
- Validation on each step
- Save draft capability
```

### Dashboard Module
```
Generate an Admin Dashboard with:
- 4 stat cards: Total Users, Active Policies, Pending Claims, Monthly Revenue
- Line chart for revenue trend (last 6 months)
- Recent activities table
- Quick actions: Add User, Create Policy, Process Claim
```

## Tips for Claude Code

1. **Reference existing patterns**: "Follow the pattern used in SampleListController"
2. **Specify UI framework**: "Use Kendo Grid for the table"
3. **Include mock data**: "Generate realistic mock data for testing"
4. **Mention validation**: "Include both client and server validation"
5. **Request comments**: "Add // SAMPLE: comments to explain the code"
6. **Specify layouts**: "Use the _MainLayout and include breadcrumbs"
7. **Include error handling**: "Add try-catch blocks and user-friendly error messages"
8. **Request AJAX operations**: "Make the delete operation use AJAX with confirmation"
9. **Specify styling**: "Use Inspinia ibox for content containers"
10. **Include loading states**: "Show loading indicator during AJAX operations"

## Troubleshooting Generated Code

If generated code doesn't work:
1. Check if controller inherits from BaseController
2. Verify view is in correct folder (/Views/[Controller]/)
3. Ensure model namespace is correct
4. Check for missing @model declaration in views
5. Verify JavaScript jQuery syntax
6. Check bundle references in view
7. Ensure AntiForgeryToken in forms
8. Verify JSON response format
9. Check Kendo Grid DataSource configuration
10. Ensure mock data methods exist

## Final Notes

This sample project is designed to be a rapid prototyping tool. When generating code:
- Focus on UI/UX patterns, not business logic
- Use simple mock data instead of database calls
- Keep controllers thin with minimal logic
- Emphasize the visual presentation and user interaction
- Follow the established patterns for consistency