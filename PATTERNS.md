# BenefitNetFlex UI Patterns Guide

## Naming Conventions

### Controllers
- **Pattern**: `[Feature]Controller.cs`
- **Examples**: `MemberController`, `PolicyController`, `ClaimController`
- **Base Class**: All controllers inherit from `BaseController`

### Views
- **Location**: `/Views/[ControllerName]/[ActionName].cshtml`
- **Partials**: Prefix with underscore `_PartialName.cshtml`
- **Shared**: Common partials in `/Views/Shared/`

### Models
- **ViewModels**: `[Feature]ViewModel.cs`
- **Form Models**: `[Feature]FormViewModel.cs`
- **List Models**: `[Feature]ListViewModel.cs`

### CSS Classes
- **Page-specific**: `.page-[pagename]`
- **Component**: `.component-[name]`
- **State**: `.is-[state]`, `.has-[feature]`
- **Utility**: `.u-[utility]`

## Common UI Patterns

### 1. List View with Kendo Grid

```csharp
// Controller
public ActionResult Index()
{
    ViewBag.Header = "Records List";
    return View();
}

[HttpPost]
public JsonResult GetGridData(GridRequest request)
{
    var data = GetFilteredData(request);
    return Json(new {
        Data = data.Items,
        Total = data.TotalCount
    });
}
```

```html
<!-- View -->
@(Html.Kendo().Grid<Model>()
    .Name("grid")
    .Columns(columns =>
    {
        columns.Bound(p => p.Id).Width(100);
        columns.Bound(p => p.Name);
        columns.Command(cmd => cmd.Edit());
    })
    .DataSource(dataSource => dataSource
        .Ajax()
        .Read(read => read.Action("GetGridData", "Controller"))
        .PageSize(20)
    )
    .Pageable()
    .Sortable()
    .Filterable()
)
```

### 2. Form with Validation

```csharp
// Model
public class FormViewModel
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(100)]
    public string Name { get; set; }

    [EmailAddress]
    public string Email { get; set; }
}

// Controller
[HttpPost]
[ValidateAntiForgeryToken]
public ActionResult Create(FormViewModel model)
{
    if (ModelState.IsValid)
    {
        // Process form
        return RedirectToAction("Success");
    }
    return View(model);
}
```

```html
<!-- View -->
@using (Html.BeginForm())
{
    @Html.AntiForgeryToken()

    <div class="form-group">
        @Html.LabelFor(m => m.Name)
        @Html.TextBoxFor(m => m.Name, new { @class = "form-control" })
        @Html.ValidationMessageFor(m => m.Name)
    </div>

    <button type="submit" class="btn btn-primary">Submit</button>
}
```

### 3. Dashboard Cards

```html
<div class="row">
    <div class="col-lg-3">
        <div class="widget style1 navy-bg">
            <div class="row">
                <div class="col-xs-4">
                    <i class="fa fa-users fa-5x"></i>
                </div>
                <div class="col-xs-8 text-right">
                    <span>Total Members</span>
                    <h2 class="font-bold">@Model.TotalMembers</h2>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 4. Tabbed Interface

```html
<div class="tabs-container">
    <ul class="nav nav-tabs">
        <li class="active"><a data-toggle="tab" href="#tab-1">General</a></li>
        <li><a data-toggle="tab" href="#tab-2">Details</a></li>
        <li><a data-toggle="tab" href="#tab-3">History</a></li>
    </ul>
    <div class="tab-content">
        <div id="tab-1" class="tab-pane active">
            <!-- Tab content -->
        </div>
    </div>
</div>
```

### 5. Modal Dialogs

```javascript
// JavaScript
function openModal(id) {
    $.get('/Controller/GetDetails/' + id, function(data) {
        $('#modalBody').html(data);
        $('#myModal').modal('show');
    });
}
```

```html
<!-- Modal HTML -->
<div class="modal fade" id="myModal">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title">Details</h4>
            </div>
            <div class="modal-body" id="modalBody">
                <!-- Content loaded via AJAX -->
            </div>
        </div>
    </div>
</div>
```

### 6. AJAX Operations

```javascript
// POST with JSON
$.ajax({
    url: '/Controller/Action',
    type: 'POST',
    data: JSON.stringify({ id: 123, name: 'Test' }),
    contentType: 'application/json',
    success: function(result) {
        if (result.success) {
            swal('Success', result.message, 'success');
        }
    }
});
```

### 7. File Upload

```html
<!-- HTML -->
<input type="file" id="fileUpload" />

<!-- JavaScript -->
$('#fileUpload').change(function() {
    var formData = new FormData();
    formData.append('file', this.files[0]);

    $.ajax({
        url: '/Controller/Upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(result) {
            console.log('Upload complete');
        }
    });
});
```

### 8. Inline Editing

```javascript
// Enable inline editing
$('.editable').click(function() {
    var $this = $(this);
    var originalValue = $this.text();

    var input = $('<input type="text" />').val(originalValue);
    $this.html(input);

    input.focus().blur(function() {
        var newValue = $(this).val();
        if (newValue !== originalValue) {
            updateField($this.data('id'), $this.data('field'), newValue);
        }
        $this.text(newValue);
    });
});
```

### 9. Notifications

```javascript
// Success notification
swal({
    title: 'Success!',
    text: 'Operation completed successfully',
    type: 'success',
    timer: 2000
});

// Confirmation dialog
swal({
    title: 'Are you sure?',
    text: 'This action cannot be undone',
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
}, function(isConfirm) {
    if (isConfirm) {
        // Perform action
    }
});
```

### 10. Loading Indicators

```javascript
// Show loading
function showLoading() {
    $('#preloader_anim').show();
}

// Hide loading
function hideLoading() {
    $('#preloader_anim').hide();
}

// AJAX with loading
$.ajax({
    url: '/api/data',
    beforeSend: showLoading,
    complete: hideLoading,
    success: function(data) {
        // Process data
    }
});
```

## Layout Structure

### Main Layout Components
1. **_MainLayout.cshtml** - Primary layout with sidebar and top navigation
2. **_Menu.cshtml** - Left sidebar navigation
3. **_TopNavbar.cshtml** - Top navigation bar with user menu
4. **_Footer.cshtml** - Page footer

### Layout Sections
```html
@section Styles {
    <!-- Page-specific CSS -->
}

@section Scripts {
    <!-- Page-specific JavaScript -->
}

@section Header {
    <!-- Custom header content -->
}
```

## Creating a New Module

### Step 1: Create Controller
```csharp
public class NewModuleController : BaseController
{
    public ActionResult Index()
    {
        ViewBag.Header = "New Module";
        ViewBag.BreadCrumb = new[] { "Home", "New Module" };
        return View();
    }
}
```

### Step 2: Create View Model
```csharp
public class NewModuleViewModel
{
    public int Id { get; set; }
    public string Name { get; set; }
    // Add properties
}
```

### Step 3: Create Views
Create folder `/Views/NewModule/` and add views:
- `Index.cshtml` - List view
- `Create.cshtml` - Create form
- `Edit.cshtml` - Edit form
- `Details.cshtml` - Detail view

### Step 4: Add Routes (if needed)
```csharp
// In RouteConfig.cs
routes.MapRoute(
    name: "NewModule",
    url: "module/{action}/{id}",
    defaults: new { controller = "NewModule", action = "Index", id = UrlParameter.Optional }
);
```

### Step 5: Add Navigation
Add menu item in `_Menu.cshtml` or appropriate navigation partial.

## Best Practices

1. **Always inherit from BaseController** for consistent behavior
2. **Use ViewBag.Header** to set page titles
3. **Use ViewBag.BreadCrumb** for navigation breadcrumbs
4. **Return JsonResponse()** for AJAX endpoints (defined in BaseController)
5. **Use data annotations** for model validation
6. **Implement loading indicators** for long-running operations
7. **Use partial views** for reusable components
8. **Follow the established naming conventions**
9. **Use bundling** for scripts and styles
10. **Implement proper error handling** in controllers

## Common CSS Classes

### Inspinia Theme Classes
- `.navy-bg` - Navy background
- `.lazur-bg` - Light blue background
- `.yellow-bg` - Yellow background
- `.red-bg` - Red background
- `.widget` - Card/widget container
- `.ibox` - Content box
- `.ibox-title` - Box header
- `.ibox-content` - Box body
- `.ibox-tools` - Box action buttons

### Utility Classes
- `.m-t-md` - Margin top medium
- `.m-b-md` - Margin bottom medium
- `.p-lg` - Padding large
- `.text-navy` - Navy text color
- `.font-bold` - Bold text
- `.pull-right` - Float right
- `.pull-left` - Float left

## JavaScript Utilities

### Common Functions
```javascript
// Format currency
function formatCurrency(amount) {
    return '$' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

// Format date
function formatDate(date) {
    return moment(date).format('MM/DD/YYYY');
}

// Validate email
function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
```

## Troubleshooting Common Issues

1. **Kendo Grid not loading**: Check DataSource URL and ensure controller action returns proper JSON
2. **Validation not working**: Ensure jquery.validate.unobtrusive.js is loaded
3. **Styles not applied**: Check bundle registration and rendering in layout
4. **AJAX errors**: Check for AntiForgeryToken in POST requests
5. **Modal not opening**: Ensure Bootstrap JS is loaded and no ID conflicts