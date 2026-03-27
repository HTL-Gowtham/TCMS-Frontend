/**
 * @file AppLayout.jsx
 * @description Shared chrome (Header + TestDesignSidebar + Navigator) wrapped
 *              around every authenticated page via React Router's <Outlet />.
 *
 * Child pages access the sidebar refresh callback via useOutletContext():
 *   const { refreshSidebar } = useOutletContext();
 */

import { Outlet, useLocation, matchPath, useNavigate } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProject } from "../../context/ProjectContext";
import Header from "./Header";
import Navigator from "./Navigator";
import TestDesignSidebar from "../sidebar/TestDesignSidebar";
import { getSuitesByProject } from "../../api/suitesApi";
import { getTestcasesBySuite } from "../../api/testcasesApi";

/** Routes that don't render the app chrome */
const HIDE_LAYOUT_PATHS = ["/", "/login", "/register"];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { activeProject, setActiveProject, projects } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  // ── Sidebar tree state ─────────────────────────────────
  const [suites, setSuites] = useState([]);
  const [suiteTestCases, setSuiteTestCases] = useState({});
  const [expandedSuites, setExpandedSuites] = useState({});

  // ── Plan modal state (lifted here so Navigator can trigger it) ─
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);

  // ── Search query (shared between Navigator and pages via Outlet) ─
  const [searchQuery, setSearchQuery] = useState("");

  const showLayout = !HIDE_LAYOUT_PATHS.includes(location.pathname.toLowerCase());

  // ── Derive active suite / testcase from URL ─────────────
  const matchTC    = matchPath("/testdesign/:projectId/:suiteId/:testcaseId", location.pathname);
  const matchSuite = matchPath("/testdesign/:projectId/:suiteId",             location.pathname);
  const activeSuiteId = matchTC?.params?.suiteId
    ? parseInt(matchTC.params.suiteId)
    : matchSuite?.params?.suiteId
    ? parseInt(matchSuite.params.suiteId)
    : null;
  const activeTestCaseId = matchTC?.params?.testcaseId
    ? parseInt(matchTC.params.testcaseId)
    : null;

  // ── Load suites when project changes ────────────────────
  const loadSuites = useCallback(async (projectId) => {
    try {
      const data = await getSuitesByProject(projectId);
      setSuites(data || []);
    } catch (err) {
      console.error("Failed to load suites:", err);
    }
  }, []);

  useEffect(() => {
    if (activeProject?.id) {
      loadSuites(activeProject.id);
    } else {
      setSuites([]);
      setSuiteTestCases({});
      setExpandedSuites({});
    }
  }, [activeProject, loadSuites]);

  // ── Lazy-load test cases when a suite is expanded ────────
  const toggleSuite = useCallback((suiteId) => {
    setExpandedSuites((prev) => {
      const willExpand = !prev[suiteId];
      if (willExpand) {
        getTestcasesBySuite(suiteId)
          .then((data) =>
            setSuiteTestCases((prevTCs) => ({ ...prevTCs, [suiteId]: data }))
          )
          .catch(console.error);
      }
      return { ...prev, [suiteId]: willExpand };
    });
  }, []);

  /**
   * refreshSidebar — called by TestDesignPage after create/edit/delete.
   * Re-fetches suite list and optionally a specific suite's test cases.
   * @param {number|null} suiteId
   */
  const refreshSidebar = useCallback(
    async (suiteId = null) => {
      if (!activeProject?.id) return;
      await loadSuites(activeProject.id);
      if (suiteId) {
        setSuiteTestCases((prev) => {
          const next = { ...prev };
          delete next[suiteId];
          return next;
        });
        try {
          const data = await getTestcasesBySuite(suiteId);
          setSuiteTestCases((prev) => ({ ...prev, [suiteId]: data }));
        } catch (err) {
          console.error("Failed to reload test cases:", err);
        }
      }
    },
    [activeProject, loadSuites]
  );

  const handleAddSuite = () => {
    if (activeProject) navigate(`/testdesign/${activeProject.id}`);
  };

  // ── Project change from sidebar dropdown ─────────────────
  const handleProjectSelect = useCallback((project) => {
    setActiveProject(project);
    if (project) navigate(`/testdesign/${project.id}`);
  }, [setActiveProject, navigate]);

  // Context passed to child pages via Outlet
  const outletContext = {
    refreshSidebar,
    isPlanModalOpen,
    setPlanModalOpen,
    searchQuery,
  };

  if (!showLayout) {
    // Auth pages render without any chrome
    return <Outlet context={outletContext} />;
  }

  return (
    <div className="app-container">
      <Header user={user} onLogout={logout} />

      <div className="app-body">
        <TestDesignSidebar
          activeProject={activeProject}
          projects={projects}
          onProjectSelect={handleProjectSelect}
          suites={suites}
          suiteTestCases={suiteTestCases}
          expandedSuites={expandedSuites}
          toggleSuite={toggleSuite}
          selectedSuiteId={activeSuiteId}
          selectedTestCaseId={activeTestCaseId}
          onAddSuite={handleAddSuite}
          onAddTestCase={(suite) =>
            navigate(`/testdesign/${activeProject.id}/${suite.id}`)
          }
        />

        <div className="right-panel-wrapper">
          <Navigator
            activeProject={activeProject}
            onCreatePlanClick={() => setPlanModalOpen(true)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <main className="app-content-scrollable">
            <Outlet context={outletContext} />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
