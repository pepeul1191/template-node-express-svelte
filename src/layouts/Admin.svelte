<script>
  import { Router, Route } from "svelte-routing";
  import Navbar from "../components/navigation/Navbar.svelte";
  import Sidebar from "../components/navigation/Sidebar.svelte";

  import Home from "../pages/admin/Home.svelte";
  import Locations from "../pages/admin/Locations.svelte";
	import WorkerRoles from "../pages/admin/WorkerRoles.svelte";
  import RepresentativeRoles from "../pages/admin/RepresentativeRoles.svelte";
  import DocumentTypes from "../pages/admin/DocumentTypes.svelte";
  import Levels from "../pages/admin/Levels.svelte";
  import EvaluationTypes from "../pages/admin/EvaluationTypes.svelte";
  import Sexs from "../pages/admin/Sexs.svelte";
  import Students from "../pages/admin/Students.svelte";
	import Workers from "../pages/admin/Workers.svelte";
	import Representatives from "../pages/admin/Representatives.svelte";
  import Academics from "../pages/admin/Academics.svelte";
	import Courses from "../pages/admin/Courses.svelte";
  import CourseSections from "../pages/admin/CourseSections.svelte"; 
	import SectionStudents from "../pages/admin/SectionStudents.svelte";
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
      <Route path="/management/worker-roles" component={WorkerRoles} />
      <Route path="/management/representative-roles" component={RepresentativeRoles} />
      <Route path="/management/document-types" component={DocumentTypes} />
      <Route path="/management/levels" component={Levels} />
      <Route path="/management/sexs" component={Sexs} />
      <Route path="/management/evaluation-types" component={EvaluationTypes} />
      <Route path="/management/students" component={Students} />
      <Route path="/management/workers" component={Workers} />
      <Route path="/management/representatives" component={Representatives} />
      <Route path="/management/academics" component={Academics} />
      <Route path="/management/courses" component={Courses} />
      <Route path="/management/courses/:courseId/sections" component={CourseSections} /> <!-- 👈 Nueva ruta con parámetro -->
      <Route path="/management/courses/:courseId/sections/:sectionId/students" component={SectionStudents} /> <!-- 👈 Nueva ruta con parámetro -->
    </main>

  </div>
</Router>

<style>
  .main-content {
    margin-left: 250px;
    width: 100%;
  }
</style>
