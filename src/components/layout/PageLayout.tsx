import { createContext, useContext, useRef, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { useCollectionOwner } from "../../api/queries";
import { useAuth } from "../../auth/AuthContext";
import { SetupGuide } from "../SetupGuide";
import { SaveBar } from "../SaveBar";
import { hasChanges, subscribe } from "../../store/pendingChanges";

const PageHeaderPortalContext = createContext<HTMLDivElement | null>(null);
const StickyOffsetContext = createContext<number>(0);

export function useStickyOffset() {
  return useContext(StickyOffsetContext);
}

export function PageHeader({ children }: { children: React.ReactNode }) {
  const container = useContext(PageHeaderPortalContext);
  if (!container) return null;
  return createPortal(children, container);
}

export function PageLayout({ children }: { children: React.ReactNode }) {
  const { data: ownerName } = useCollectionOwner();
  const { user, isOwner, logout, isLoading: authLoading } = useAuth();
  const [showSetup, setShowSetup] = useState(false);
  const showSaveBar = user && isOwner && useSyncExternalStore(subscribe, hasChanges);
  const [headerEl, setHeaderEl] = useState<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const [stickyOffset, setStickyOffset] = useState(0);
  const headerWrapperRef = useRef<HTMLDivElement | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const headerWrapperCallback = useCallback((node: HTMLDivElement | null) => {
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }
    headerWrapperRef.current = node;
    if (node) {
      const update = () => {
        setStickyOffset(node.offsetHeight);
      };
      resizeObserverRef.current = new ResizeObserver(update);
      resizeObserverRef.current.observe(node);
      update();
    }
  }, []);

  const headerRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    setHeaderEl(node);

    if (node) {
      setHasContent(node.childNodes.length > 0);
      observerRef.current = new MutationObserver(() => {
        setHasContent(node.childNodes.length > 0);
      });
      observerRef.current.observe(node, { childList: true });
    }
  }, []);

  return (
    <PageHeaderPortalContext.Provider value={headerEl}>
      <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
        <nav className="flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-xl font-bold text-gray-900">
                {ownerName ? `${ownerName}'s Collection` : "Pokemon Collection"}
              </Link>
              <div className="flex items-center gap-3">
                {user && isOwner ? (
                  <>
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm text-gray-600">{user.login}</span>
                    <button
                      onClick={logout}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Sign out
                    </button>
                  </>
                ) : authLoading ? (
                  <span className="text-sm text-gray-400">Connecting...</span>
                ) : (
                  <button
                    onClick={() => setShowSetup(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign in to edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
        <main className="flex-1 overflow-y-auto">
          <div
            ref={headerWrapperCallback}
            className={`${hasContent ? "sticky top-0 z-30 bg-gray-50" : ""}`}
          >
            <div
              ref={headerRef}
              className="max-w-4xl mx-auto px-4 py-3 space-y-3"
            />
          </div>
          <StickyOffsetContext.Provider value={stickyOffset}>
            <div className={`max-w-4xl mx-auto px-4 pt-2 ${showSaveBar ? "pb-20" : "pb-6"}`}>{children}</div>
          </StickyOffsetContext.Provider>
        </main>
      </div>
      {showSaveBar && <SaveBar />}
      {showSetup && <SetupGuide onClose={() => setShowSetup(false)} />}
    </PageHeaderPortalContext.Provider>
  );
}
