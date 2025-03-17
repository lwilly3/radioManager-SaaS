import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import PresenterPrivileges from '../components/settings/PresenterPrivileges';
import GeneralSettings from '../components/settings/GeneralSettings';
import RoleTemplates from '../components/settings/RoleTemplates';
import PermissionAuditLog from '../components/settings/PermissionAuditLog';
// import PresentersList from '../components/settings/PresentersList';
import PresentersList from '../components/settings/presenters/PresenterList';

import RoleManagement from '../components/settings/RoleManagement';
import {
  Settings as SettingsIcon,
  Users,
  Shield,
  BookTemplate,
  History,
  UserCog,
} from 'lucide-react';

// Composant ErrorBoundary pour isoler les erreurs
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          <p>Une erreur est survenue : {this.state.error?.message}</p>
          <p>Veuillez réessayer ou contacter le support.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Fonction de log pour débogage
const log = (message: string) => console.log(`[Settings] ${message}`);

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Log pour vérifier l'état initial et les mises à jour
  useEffect(() => {
    log(`Initial activeTab: ${activeTab}`);
  }, []);

  const handleApplyTemplate = (template: any) => {
    setNotification({
      type: 'success',
      message: `Le modèle "${template.name}" est prêt à être appliqué. Sélectionnez un présentateur dans l'onglet Privilèges.`,
    });
    setTimeout(() => {
      setNotification(null);
      setActiveTab('privileges');
      log(`Switched to privileges tab after template apply`);
    }, 3000);
  };

  const handleTabChange = (value: string) => {
    log(
      `Tab changed to: ${value}, current activeTab before update: ${activeTab}`
    );
    setActiveTab(value);
    log(`Tab changed to: ${value}, activeTab after update: ${activeTab}`);
  };

  // Rendu des onglets
  const renderTabs = () => (
    <TabsList className="bg-white rounded-lg shadow p-1 mb-6 overflow-x-auto flex-nowrap">
      <TabsTrigger
        key="general"
        value="general"
        active={activeTab === 'general'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <SettingsIcon className="h-4 w-4" />
        <span>Général</span>
      </TabsTrigger>
      <TabsTrigger
        key="presenters"
        value="presenters"
        active={activeTab === 'presenters'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <Users className="h-4 w-4" />
        <span>Présentateurs</span>
      </TabsTrigger>
      <TabsTrigger
        key="privileges"
        value="privileges"
        active={activeTab === 'privileges'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <Shield className="h-4 w-4" />
        <span>Privilèges</span>
      </TabsTrigger>
      <TabsTrigger
        key="roles"
        value="roles"
        active={activeTab === 'roles'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <UserCog className="h-4 w-4" />
        <span>Rôles</span>
      </TabsTrigger>
      <TabsTrigger
        key="templates"
        value="templates"
        active={activeTab === 'templates'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <BookTemplate className="h-4 w-4" />
        <span>Modèles de rôles</span>
      </TabsTrigger>
      <TabsTrigger
        key="audit"
        value="audit"
        active={activeTab === 'audit'}
        className="flex items-center gap-2 whitespace-nowrap"
        onValueChange={handleTabChange}
      >
        <History className="h-4 w-4" />
        <span>Journal d'audit</span>
      </TabsTrigger>
    </TabsList>
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600">
          Gérez les paramètres de votre station radio
        </p>
      </header>

      {notification && (
        <div
          className={`p-4 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          } rounded-lg flex items-center gap-2`}
        >
          <div
            className={`w-2 h-2 rounded-full ${
              notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          ></div>
          <p>{notification.message}</p>
        </div>
      )}

      <Tabs
        key={activeTab}
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        {renderTabs()}
        <TabsContent
          key="general-content"
          value="general"
          active={activeTab === 'general'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering GeneralSettings for tab: ${activeTab}`)}
          <GeneralSettings />
        </TabsContent>

        <TabsContent
          key="presenters-content"
          value="presenters"
          active={activeTab === 'presenters'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering PresentersList for tab: ${activeTab}`)}
          <PresentersList />
        </TabsContent>

        <TabsContent
          key="privileges-content"
          value="privileges"
          active={activeTab === 'privileges'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering PresenterPrivileges for tab: ${activeTab}`)}
          <PresenterPrivileges />
        </TabsContent>

        <TabsContent
          key="roles-content"
          value="roles"
          active={activeTab === 'roles'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering RoleManagement for tab: ${activeTab}`)}
          <ErrorBoundary>
            <RoleManagement />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent
          key="templates-content"
          value="templates"
          active={activeTab === 'templates'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering RoleTemplates for tab: ${activeTab}`)}
          <ErrorBoundary>
            <RoleTemplates onApplyTemplate={handleApplyTemplate} />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent
          key="audit-content"
          value="audit"
          active={activeTab === 'audit'}
          parentValue={activeTab}
          className="mt-0"
        >
          {log(`Rendering PermissionAuditLog for tab: ${activeTab}`)}
          <PermissionAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
