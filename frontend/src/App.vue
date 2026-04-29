<script setup lang="ts">
import { ref } from 'vue'
import PetList from './components/PetList.vue'
import PetRegister from './components/PetRegister.vue'

const currentView = ref<'list' | 'register'>('list')
const petListRef = ref<InstanceType<typeof PetList> | null>(null)

const onPetAdded = () => {
  currentView.value = 'list'
  if (petListRef.value) {
    petListRef.value.fetchPets()
  }
}

const showList = () => {
  currentView.value = 'list'
}
</script>

<template>
  <div class="app-container">
    <header class="main-header">
      <div class="logo-container">
        <img src="/mongodb-logo.svg" alt="MongoDB Logo" class="mongodb-logo" />
        <span class="project-title">MongoDB Pets</span>
      </div>
      <nav class="main-nav">
        <button 
          :class="{ active: currentView === 'list' }" 
          @click="showList"
        >
          Browse Pets
        </button>
        <button 
          :class="{ active: currentView === 'register' }" 
          @click="currentView = 'register'"
        >
          Register New Pet
        </button>
      </nav>
    </header>

    <main>
      <PetList v-if="currentView === 'list'" ref="petListRef" />
      <PetRegister v-if="currentView === 'register'" @pet-added="onPetAdded" />
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: 'Euclid Circular A', 'Inter', system-ui, sans-serif;
  background-color: #f9fbfa;
  color: #001e2b;
}

.app-container {
  min-height: 100vh;
}

.main-header {
  background-color: #001e2b;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.mongodb-logo {
  height: 40px;
}

.project-title {
  color: #00ed64;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.main-nav {
  display: flex;
  gap: 10px;
}

.main-nav button {
  padding: 10px 20px;
  border: none;
  background: transparent;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.main-nav button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.main-nav button.active {
  color: #00ed64;
  background-color: rgba(0, 237, 100, 0.1);
}

main {
  padding: 20px;
}
</style>
