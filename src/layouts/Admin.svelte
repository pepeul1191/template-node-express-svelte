<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../components/navigation/Navbar.svelte";
  import Sidebar from "../components/navigation/Sidebar.svelte";

  import Home from "../pages/admin/Home.svelte";
  import Locations from "../pages/admin/Locations.svelte";
	import EmployeeRoles from "../pages/admin/EmployeeRoles.svelte";
  import RepresentativeRoles from "../pages/admin/RepresentativeRoles.svelte";
  import DocumentTypes from "../pages/admin/DocumentTypes.svelte";
  // import Students from "../pages/admin/Students.svelte";
</script>

<Router>
  <Navbar />

  <div class="d-flex app-content">
    <Sidebar />

    <!-- CONTENIDO DINÁMICO -->
    <main class="main-content p-4" id="content">
      <Route path="/" component={Home} />
      <Route path="/management/locations" component={Locations} />
      <Route path="/management/employee-roles" component={EmployeeRoles} />
      <Route path="/management/representative-roles" component={RepresentativeRoles} />
      <Route path="/management/document-types" component={DocumentTypes} />
      <!-- <Route path="/students" component={Students} /> -->
    </main>

  </div>
</Router>

<style>
  .main-content {
    margin-left: 250px;
    width: 100%;
  }
</style>
