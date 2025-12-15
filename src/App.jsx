import { CharacterProvider } from './context/CharacterContext';
import { DiabloLayout } from './components/layout/DiabloLayout';
import { AvatarDisplay } from './components/avatar/AvatarDisplay';
import { StatInput } from './components/ui/StatInput';
import './App.css';

function App() {
  return (
    <CharacterProvider>
      <DiabloLayout>
        <div className="content-grid">
          <AvatarDisplay />
          <StatInput />
        </div>
      </DiabloLayout>
    </CharacterProvider>
  );
}

export default App;
