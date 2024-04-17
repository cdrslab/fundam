import ReactDOM from 'react-dom/client'

import './style.css'
import App from './App'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <App />,
)

// document.querySelector<HTMLDivElement>("#app")!.innerHTML = (
//   <div>
//     ${List()}
//     </div>
// )

// setupCounter(document.querySelector<HTMLButtonElement>("#counter")!);
