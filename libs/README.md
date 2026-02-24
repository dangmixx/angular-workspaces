# @dangmixx/libs

Lightweight and reusable state utilities for Angular applications ---
built around a clean, type-safe **Loadable State pattern**.

> Simplify async state management. Eliminate boolean chaos. Keep your
> code predictable.

------------------------------------------------------------------------

## ✨ Features

-   Typed Loadable State pattern
-   Minimal and framework-friendly
-   Angular compatible
-   RxJS friendly
-   Tree-shakable
-   ES2022 output
-   Full TypeScript definitions included

------------------------------------------------------------------------

## 📦 Installation

``` bash
npm install @dangmixx/libs
```

or

``` bash
yarn add @dangmixx/libs
```

------------------------------------------------------------------------

## 🎯 Why Loadable State?

Managing async UI state often becomes messy:

``` ts
isLoading = false;
error: string | null = null;
data: User[] = [];
```

With `LoadableState<T>`:

``` ts
state = createLoadableState<User[]>();
```

One state object. Fully typed. Predictable transitions.

------------------------------------------------------------------------

## 🚀 Quick Start

### Create a loadable state

``` ts
import { createLoadableState } from '@dangmixx/libs';

const state = createLoadableState<string>();
```

### Set loading

``` ts
state.loading();
```

### Set success

``` ts
state.success('Hello world');
```

### Set error

``` ts
state.error('Something went wrong');
```

------------------------------------------------------------------------

## 🧠 Angular HTTP Example

``` ts
state = createLoadableState<User[]>();

loadUsers() {
  this.state.loading();

  this.http.get<User[]>('/api/users').subscribe({
    next: users => this.state.success(users),
    error: err => this.state.error(err.message)
  });
}
```

Template:

``` html
<div *ngIf="state.isLoading()">Loading...</div>

<div *ngIf="state.isError()">
  Error: {{ state.error }}
</div>

<div *ngIf="state.isSuccess()">
  <pre>{{ state.data | json }}</pre>
</div>
```

------------------------------------------------------------------------

## 🧱 API

### createLoadableState`<T>`{=html}()

Creates a new loadable state instance.

### State Shape

``` ts
interface LoadableState<T> {
  data: T | null;
  error: unknown;
  status: 'idle' | 'loading' | 'success' | 'error';
}
```

### Available Methods

-   `loading()` → set state to loading
-   `success(data: T)` → set state to success
-   `error(err: unknown)` → set state to error
-   `reset()` → reset to idle
-   `isLoading()` → boolean
-   `isSuccess()` → boolean
-   `isError()` → boolean

------------------------------------------------------------------------

## 🌲 Tree Shaking

-   Built with ES2022
-   Distributed as FESM2022
-   Side-effect free

Only what you import is included in your final bundle.

------------------------------------------------------------------------

## 🛠 Development

``` bash
ng build libs
```

Output:

    dist/libs

------------------------------------------------------------------------

## 📌 Versioning

Semantic Versioning:

-   PATCH → bug fixes
-   MINOR → new features
-   MAJOR → breaking changes

------------------------------------------------------------------------

## 🐛 Issues

https://github.com/dangmixx/angular-workspaces/issues

------------------------------------------------------------------------

## 📄 License

MIT © dangmixx
