import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import StudentList from "./pages/StudentList";
import StudentHome from "./pages/StudentHome";
import LearningPlans from "./pages/LearningPlans";
import Knowledge from "./pages/Knowledge";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={StudentList} />
      <Route path={"/students/:id"} component={StudentHome} />
      <Route path={"/plans"} component={LearningPlans} />
      <Route path={"/knowledge"} component={Knowledge} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
