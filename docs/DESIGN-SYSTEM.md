# Design System Documentation

## Overview

BenefitNetFlex.Sample uses the **Inspinia Admin Theme** built on Bootstrap 3.4.1, combined with **Kendo UI 2019.1.220** (Nova theme) for rich data components.

---

## Color Palette

### Primary Colors

| Name | Hex | Usage | CSS Class |
|------|-----|-------|-----------|
| **Navy** | `#1AB394` | Primary actions, links, accents | `.navy-bg`, `.text-navy`, `.btn-primary` |
| **Dark Navy** | `#1C84C6` | Secondary actions | `.btn-success`, `.bg-primary` |
| **Red** | `#ED5565` | Errors, alerts, danger actions | `.color-red`, `.btn-danger` |
| **Yellow/Orange** | `#F8AC59` | Warnings | `.btn-warning`, `.color-yellow` |
| **Green** | `#1AB394` | Success states | `.color-green` |

### Neutral Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Dark Gray** | `#676A6C` | Body text |
| **Medium Gray** | `#999999` | Muted text |
| **Light Gray** | `#F3F3F4` | Backgrounds |
| **Border Gray** | `#E7EAEC` | Borders, dividers |
| **White** | `#FFFFFF` | Cards, content areas |
| **Dark Background** | `#363636` | Page background |

### Kendo UI Theme Colors (Nova)

| Element | Color |
|---------|-------|
| Grid Header Background | `#F5F5F6` |
| Grid Border | `#E0E0E0` |
| Selected State | `#ED5565` (red text + underline) |
| Hover State | `#F5F5F5` (light gray) |

---

## Typography

### Font Family

```css
font-family: 'Sarabun', sans-serif;
```

**Fallback Stack:**
```css
font-family: 'Sarabun', 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

### Font Sizes

| Element | Size | Class |
|---------|------|-------|
| Body text | 13px | (default) |
| H1 | 30px | `h1` |
| H2 | 24px | `h2` |
| H3 | 16px | `h3` |
| H4 | 14px | `h4` |
| H5 | 12px | `h5` |
| Small text | 12px | `.small`, `small` |

### Font Weights

| Weight | Usage | Class |
|--------|-------|-------|
| Normal (400) | Body text | (default) |
| Bold (600) | Headings, emphasis | `.font-bold`, `b`, `strong` |

---

## Spacing System

### Margin Classes

| Class | Value | Description |
|-------|-------|-------------|
| `.m-t-xs` | 5px | Margin top extra small |
| `.m-t-sm` | 10px | Margin top small |
| `.m-t-md` | 15px | Margin top medium |
| `.m-t-lg` | 20px | Margin top large |
| `.m-t-xl` | 30px | Margin top extra large |
| `.m-b-*` | Same | Margin bottom |
| `.m-l-*` | Same | Margin left |
| `.m-r-*` | Same | Margin right |
| `.m-0` | 0 | No margin |

### Padding Classes

| Class | Value | Description |
|-------|-------|-------------|
| `.p-xs` | 5px | Padding extra small |
| `.p-sm` | 10px | Padding small |
| `.p-md` | 15px | Padding medium |
| `.p-lg` | 20px | Padding large |
| `.p-xl` | 30px | Padding extra large |

---

## Common Components

### 1. Content Box (ibox)

The primary container for content sections.

```html
<div class="ibox float-e-margins">
    <div class="ibox-title">
        <h5>Section Title</h5>
        <div class="ibox-tools">
            <a class="collapse-link">
                <i class="fa fa-chevron-up"></i>
            </a>
        </div>
    </div>
    <div class="ibox-content">
        <!-- Content here -->
    </div>
</div>
```

**Variations:**
- `.ibox-content.no-padding` - Remove padding
- `.ibox-content.text-center` - Center content

### 2. Tabs Container

```html
<div class="tabs-container">
    <ul class="nav nav-tabs">
        <li class="active">
            <a data-toggle="tab" href="#tab-1">Tab 1</a>
        </li>
        <li>
            <a data-toggle="tab" href="#tab-2">Tab 2</a>
        </li>
    </ul>
    <div class="tab-content">
        <div id="tab-1" class="tab-pane active">
            <div class="panel-body">
                <!-- Tab 1 content -->
            </div>
        </div>
        <div id="tab-2" class="tab-pane">
            <div class="panel-body">
                <!-- Tab 2 content -->
            </div>
        </div>
    </div>
</div>
```

### 3. Collapsible Panel (Search)

```html
<div class="panel-group" id="accordion">
    <div class="panel panel-default">
        <div class="panel-heading">
            <h5 class="panel-title">
                <a data-toggle="collapse" data-parent="#accordion"
                   href="#collapseSearch" class="collapsed">
                    <i class="fa fa-search"></i>&nbsp;Search
                </a>
            </h5>
        </div>
        <div id="collapseSearch" class="panel-collapse collapse">
            <div class="panel-body">
                <!-- Search form here -->
            </div>
        </div>
    </div>
</div>
```

### 4. Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">
    <i class="fa fa-plus"></i> Add New
</button>

<!-- Success Button -->
<button class="btn btn-success">Save</button>

<!-- Default/Secondary Button -->
<button class="btn btn-default">Cancel</button>

<!-- Danger Button -->
<button class="btn btn-danger">Delete</button>

<!-- Medium Width Button -->
<button class="btn btn-w-m btn-primary">Medium Width</button>

<!-- Full Width Button -->
<button class="btn btn-block btn-primary">Full Width</button>
```

### 5. Form Controls

```html
<div class="form-horizontal">
    <div class="form-group">
        <label class="col-lg-4 control-label">Field Label</label>
        <div class="col-lg-8">
            <input type="text" class="form-control" placeholder="Enter value">
        </div>
    </div>
    <div class="form-group">
        <label class="col-lg-4 control-label">Dropdown</label>
        <div class="col-lg-8">
            <select class="form-control">
                <option>Option 1</option>
                <option>Option 2</option>
            </select>
        </div>
    </div>
    <div class="form-group">
        <label class="col-lg-4 control-label">Checkbox</label>
        <div class="col-lg-8">
            <input type="checkbox" class="checkbox">
        </div>
    </div>
</div>
```

### 6. Kendo Grid

```html
<div id="GridName" style="margin-bottom: 10px"></div>

<script>
$("#GridName").kendoGrid({
    dataSource: {
        transport: {
            read: {
                url: "@Url.Action("SearchAsync")",
                type: "POST",
                dataType: "json",
                data: getSearchParams
            }
        },
        schema: {
            data: "Data",
            total: "Total",
            model: {
                fields: {
                    Id: { type: "number" },
                    Name: { type: "string" },
                    Date: { type: "date" }
                }
            }
        },
        pageSize: 10,
        serverPaging: true,
        serverFiltering: true,
        serverSorting: true
    },
    scrollable: { height: 456 },
    pageable: true,
    sortable: true,
    columns: [
        { field: "Name", title: "Name", width: 200 },
        { field: "Status", title: "Status", width: 100 },
        {
            field: "Date",
            title: "Date",
            width: 120,
            format: "{0:dd/MM/yyyy}"
        },
        {
            title: "Actions",
            width: 80,
            template: "<a href='#=QueryString#'>View</a>"
        }
    ]
});
</script>
```

**Grid CSS Customization:**
```css
/* White rows, gray hover */
#GridName .k-grid-content tr,
#GridName .k-grid-content tr.k-alt {
    background-color: #fff !important;
}

#GridName .k-grid-content tr:hover {
    background-color: #f5f5f5 !important;
}

/* Header styling */
#GridName .k-grid-header th.k-header {
    background-color: #f5f5f6 !important;
    padding: 15px 12px;
    white-space: normal !important;
}

/* Pagination - transparent, red selected */
#GridName .k-pager-wrap,
#GridName .k-pager-wrap * {
    background-color: transparent !important;
}

#GridName .k-pager-numbers .k-state-selected {
    color: #ed5565 !important;
}
```

### 7. Alert Messages

```html
<!-- Success Alert -->
<div class="alert alert-success">
    <strong>Success!</strong> Operation completed.
</div>

<!-- Warning Alert -->
<div class="alert alert-warning">
    <strong>Warning!</strong> Please review.
</div>

<!-- Danger Alert -->
<div class="alert alert-danger">
    <strong>Error!</strong> Something went wrong.
</div>

<!-- Info Alert -->
<div class="alert alert-info">
    <strong>Info:</strong> Additional information.
</div>
```

### 8. Modal Dialog

```html
<div class="modal fade" id="modalName" tabindex="-1" role="dialog">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal">
                    <span>&times;</span>
                </button>
                <h4 class="modal-title">Modal Title</h4>
            </div>
            <div class="modal-body">
                <!-- Modal content -->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary">Save</button>
                <button type="button" class="btn btn-default" data-dismiss="modal">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</div>
```

---

## Layout Patterns

### 1. Main Page Layout

```html
@{
    Layout = "~/Views/Shared/_MainLayout.cshtml";
    ViewBag.Header = "Page Title";
}

<div class="tabs-container">
    <ul class="nav nav-tabs">
        <li class="active">
            <a data-toggle="tab" href="#tab-main">Main Tab</a>
        </li>
    </ul>
    <div class="tab-content">
        <div id="tab-main" class="tab-pane active">
            <div class="panel-body">
                <div class="ibox float-e-margins">
                    <div class="ibox-content">
                        <!-- Page content -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

### 2. Two-Column Layout

```html
<div class="row">
    <div class="col-lg-6">
        <!-- Left column -->
    </div>
    <div class="col-lg-6">
        <!-- Right column -->
    </div>
</div>
```

### 3. Grid with Search Layout

```html
<div class="ibox float-e-margins">
    <div class="ibox-content">
        <!-- Collapsible Search Panel -->
        <div class="panel-group" id="accordion">
            <div class="panel panel-default">
                <div class="panel-heading">
                    <h5 class="panel-title">
                        <a data-toggle="collapse" href="#searchPanel">
                            <i class="fa fa-search"></i>&nbsp;Search
                        </a>
                    </h5>
                </div>
                <div id="searchPanel" class="panel-collapse collapse">
                    <div class="panel-body">
                        <div class="form-horizontal">
                            <!-- Search fields -->
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <label class="col-lg-4 control-label">Name</label>
                                        <div class="col-lg-8">
                                            <input class="form-control" id="searchName">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-lg-6">
                                    <div class="form-group">
                                        <div class="col-lg-offset-4 col-lg-8">
                                            <button class="btn btn-primary" onclick="search()">
                                                Search
                                            </button>
                                            <button class="btn btn-default" onclick="resetFilter()">
                                                Reset
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Data Grid -->
        <div id="dataGrid" style="margin-bottom: 10px"></div>

        <!-- Action Buttons -->
        <a href="@Url.Action("Add")" class="btn btn-w-m btn-primary">
            <i class="fa fa-plus"></i>&nbsp;Add New
        </a>
        <button class="btn btn-w-m btn-primary" id="exportBtn">
            <i class="fa fa-file-excel-o"></i>&nbsp;Export to Excel
        </button>
    </div>
</div>
```

---

## Icons

Using **Font Awesome 4.x**

### Common Icons

| Icon | Class | Usage |
|------|-------|-------|
| Search | `fa fa-search` | Search buttons |
| Plus | `fa fa-plus` | Add buttons |
| Edit | `fa fa-pencil` | Edit actions |
| Delete | `fa fa-trash` | Delete actions |
| Save | `fa fa-save` | Save buttons |
| Download | `fa fa-download` | Download actions |
| Excel | `fa fa-file-excel-o` | Export to Excel |
| Check | `fa fa-check` | Success states |
| Check Circle | `fa fa-check-circle-o` | Active/success status |
| Times | `fa fa-times` | Error/close |
| Times Circle | `fa fa-times-circle` | Inactive/error status |
| Arrow Up | `fa fa-arrow-circle-up` | Increase indicator |
| Arrow Down | `fa fa-arrow-circle-down` | Decrease indicator |
| User | `fa fa-user` | User/profile |
| Cog | `fa fa-cog` | Settings |
| Home | `fa fa-home` | Dashboard/home |

### Icon Usage

```html
<!-- In buttons -->
<button class="btn btn-primary">
    <i class="fa fa-plus"></i>&nbsp;Add New
</button>

<!-- Status indicators -->
<i class="fa fa-check-circle-o color-green"></i>  <!-- Active -->
<i class="fa fa-times color-red"></i>              <!-- Inactive -->

<!-- In navigation -->
<a href="#"><i class="fa fa-home"></i> Dashboard</a>
```

---

## Responsive Breakpoints

Bootstrap 3 grid breakpoints:

| Breakpoint | Width | Class Prefix |
|------------|-------|--------------|
| Extra Small (Phone) | < 768px | `.col-xs-*` |
| Small (Tablet) | >= 768px | `.col-sm-*` |
| Medium (Desktop) | >= 992px | `.col-md-*` |
| Large (Wide Desktop) | >= 1200px | `.col-lg-*` |

### Common Grid Patterns

```html
<!-- Full width on mobile, half on desktop -->
<div class="col-xs-12 col-lg-6">

<!-- Always two columns -->
<div class="col-xs-6">

<!-- Three columns on desktop, one on mobile -->
<div class="col-xs-12 col-md-4">
```

---

## CSS File Structure

```
Content/
├── custom/
│   ├── motornet.css         # Main custom styles
│   ├── site.css             # Base site styles
│   ├── progressbar.css      # Progress bar component
│   ├── spinner.css          # Loading spinner
│   └── member/              # Feature-specific
│       └── details.css
├── libraries/
│   └── kendo/2019.1.220/
│       ├── kendo.common-nova.min.css
│       ├── kendo.nova.min.css
│       └── kendo.dataviz.min.css
├── plugins/
│   ├── iCheck/              # Checkbox styling
│   ├── sweetalert/          # Alert dialogs
│   └── fullcalendar/        # Calendar component
├── animate.css              # CSS animations
├── bootstrap.min.css        # Bootstrap 3
└── style.css                # Inspinia theme
```

---

## Bundle References

From `App_Start/BundleConfig.cs`:

```csharp
// Core styles
bundles.Add(new StyleBundle("~/Content/css").Include(
    "~/Content/bootstrap.min.css",
    "~/Content/animate.css",
    "~/Content/style.css",
    "~/Content/custom/site.css",
    "~/Content/custom/motornet.css"));

// Kendo UI styles (Nova theme)
bundles.Add(new StyleBundle("~/Content/kendo/css").Include(
    "~/Content/libraries/kendo/2019.1.220/kendo.common-nova.core.min.css",
    "~/Content/libraries/kendo/2019.1.220/kendo.common-nova.min.css",
    "~/Content/libraries/kendo/2019.1.220/kendo.nova.min.css"));

// Font Awesome
bundles.Add(new StyleBundle("~/font-awesome/css").Include(
    "~/Content/font-awesome/css/font-awesome.min.css"));
```

---

*Last Updated: 2026-01-02*
*Based on Inspinia Admin Theme + Kendo UI Nova Theme*
