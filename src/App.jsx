import DboxSystem from '../DboxSystem';


// Main App component with Router
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<DboxSystem />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
