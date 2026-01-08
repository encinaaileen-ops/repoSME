================================================================================
                    BenefitNetFlex.Sample - Quick Start Guide
================================================================================

This is an ASP.NET MVC 5 scaffold project for rapid MVP development of employee
benefits management applications.

--------------------------------------------------------------------------------
                              TEST ACCOUNTS
--------------------------------------------------------------------------------

Use these credentials to log into the application:

  Username        Password        Role
  --------        --------        ----
  admin           admin123        Administrator
  user1           password1       Standard User
  demo            demo123         Demo User

--------------------------------------------------------------------------------
                         USING CLAUDE CODE COMMANDS
--------------------------------------------------------------------------------

This project includes custom Claude Code commands to help product owners and
developers quickly generate features. These commands are located in:

  .claude/commands/

AVAILABLE COMMANDS:

1. /create-prd
   Creates a Product Requirements Document interactively.

   Usage: Type "/create-prd" in Claude Code

   Claude will ask you questions about:
   - Feature name and description
   - User stories and acceptance criteria
   - Data fields and validation rules
   - UI requirements

   Output: A structured PRD document ready for development.

2. /generate-mvp
   Generates working code from a PRD or feature description.

   Usage: Type "/generate-mvp" in Claude Code

   Claude will generate:
   - Controller with proper BaseController inheritance
   - ViewModel with Data Annotations
   - Razor View with Kendo Grid or Form
   - JavaScript module if needed

   All generated code follows the project's coding standards.

3. /create-spec
   Creates a detailed technical specification from requirements.

   Usage: Type "/create-spec" in Claude Code

   Output: Technical design document with:
   - Architecture decisions
   - Data models
   - API endpoints
   - Implementation steps

4. /validate-feature
   Validates existing code against project standards.

   Usage: Type "/validate-feature" in Claude Code

   Checks for:
   - BaseController inheritance
   - Proper Kendo Grid response format
   - ViewBag.Header usage
   - JavaScript module pattern
   - CSS class conventions

--------------------------------------------------------------------------------
                          HOW TO USE CLAUDE CODE
--------------------------------------------------------------------------------

1. ASKING QUESTIONS
   Simply describe what you want to build or ask about the codebase:

   "How do I add a new page with a data grid?"
   "What's the pattern for form validation?"
   "Show me an example of a controller action"

2. REQUESTING FEATURES
   Describe your feature in plain language:

   "Add a Members page that shows a list of members with search"
   "Create a form to add new policies"
   "Add a dashboard widget showing total clients"

3. REFERENCING EXISTING CODE
   Point Claude to similar features:

   "Create a page like the Clients page but for Policies"
   "Add search functionality like in ClientController"

4. BEST PRACTICES
   - Start simple - request the basic version first
   - Reference existing patterns in the codebase
   - Use the /create-prd command for complex features
   - Use /validate-feature to check generated code

--------------------------------------------------------------------------------
                            BUILD COMMANDS
--------------------------------------------------------------------------------

Restore NuGet packages:
  nuget restore BenefitNetFlex.Sample.sln

Build the solution:
  msbuild BenefitNetFlex.Sample.sln /p:Configuration=Debug

Run in Visual Studio:
  Press F5 or use IIS Express

--------------------------------------------------------------------------------
                          PROJECT STRUCTURE
--------------------------------------------------------------------------------

Key folders:
  Controllers/          MVC Controllers (inherit from BaseController)
  Models/               ViewModels with Data Annotations
  Views/                Razor views organized by controller
  Views/Shared/         Layouts, menus, and partial views
  Scripts/custom/       JavaScript modules
  Content/custom/       Custom CSS styles
  Hubs/                 SignalR hubs for real-time features

Key files:
  CLAUDE.md             Full project documentation for Claude
  App_Start/BundleConfig.cs    Script and style bundles
  Controllers/BaseController.cs    Base class for all controllers

--------------------------------------------------------------------------------
                           REFERENCE PAGES
--------------------------------------------------------------------------------

When building new features, reference these existing implementations:

  Grid with Search:     Views/Client/Clients.cshtml
  Dashboard Widgets:    Views/Dashboard/Index.cshtml
  Form Example:         Views/SampleForm/
  Controller Pattern:   Controllers/ClientController.cs

================================================================================
                              Need Help?
================================================================================

1. Read CLAUDE.md for detailed coding conventions
2. Use /create-prd to structure your requirements
3. Ask Claude about any pattern in the codebase

================================================================================
