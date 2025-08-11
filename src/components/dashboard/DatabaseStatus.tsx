import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Database, 
  Users, 
  Building, 
  FileText,
  Loader2
} from 'lucide-react';
import { testDatabaseConnection, getDatabaseStats, type DatabaseConnectionTest } from '@/lib/database-test';

export function DatabaseStatus() {
  const [connectionStatus, setConnectionStatus] = useState<DatabaseConnectionTest | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const [connectionResult, statsResult] = await Promise.all([
        testDatabaseConnection(),
        getDatabaseStats()
      ]);
      
      setConnectionStatus(connectionResult);
      setStats(statsResult);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking database connection:', error);
      setConnectionStatus({
        isConnected: false,
        tablesExist: false,
        canQuery: false,
        error: 'Failed to check connection',
        details: {
          organizations: false,
          profiles: false,
          contacts: false,
          chartOfAccounts: false,
          invoices: false,
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (status: boolean) => {
    return status ? CheckCircle : XCircle;
  };

  const getStatusBadge = (status: boolean, label: string) => {
    return (
      <Badge variant={status ? 'default' : 'destructive'} className="text-xs">
        {status ? '✓' : '✗'} {label}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Database Status
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={checkConnection}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && !connectionStatus ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Checking database connection...</span>
          </div>
        ) : connectionStatus ? (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center space-x-2">
              {React.createElement(
                getStatusIcon(connectionStatus.isConnected && connectionStatus.tablesExist && connectionStatus.canQuery),
                { 
                  className: `h-5 w-5 ${getStatusColor(
                    connectionStatus.isConnected && connectionStatus.tablesExist && connectionStatus.canQuery
                  )}` 
                }
              )}
              <span className="font-medium">
                {connectionStatus.isConnected && connectionStatus.tablesExist && connectionStatus.canQuery
                  ? 'Database Connected'
                  : 'Database Issues Detected'
                }
              </span>
            </div>

            {/* Error Message */}
            {connectionStatus.error && (
              <Alert variant="destructive">
                <AlertDescription>{connectionStatus.error}</AlertDescription>
              </Alert>
            )}

            {/* Connection Details */}
            <div className="grid grid-cols-2 gap-2">
              {getStatusBadge(connectionStatus.isConnected, 'Connected')}
              {getStatusBadge(connectionStatus.tablesExist, 'Tables')}
              {getStatusBadge(connectionStatus.canQuery, 'Queries')}
              {getStatusBadge(connectionStatus.details.organizations, 'Organizations')}
            </div>

            {/* Table Status Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Table Status:</h4>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center ${getStatusColor(connectionStatus.details.organizations)}`}>
                  <Building className="h-3 w-3 mr-1" />
                  Organizations
                </div>
                <div className={`flex items-center ${getStatusColor(connectionStatus.details.profiles)}`}>
                  <Users className="h-3 w-3 mr-1" />
                  Profiles
                </div>
                <div className={`flex items-center ${getStatusColor(connectionStatus.details.contacts)}`}>
                  <Users className="h-3 w-3 mr-1" />
                  Contacts
                </div>
                <div className={`flex items-center ${getStatusColor(connectionStatus.details.chartOfAccounts)}`}>
                  <FileText className="h-3 w-3 mr-1" />
                  Accounts
                </div>
                <div className={`flex items-center ${getStatusColor(connectionStatus.details.invoices)}`}>
                  <FileText className="h-3 w-3 mr-1" />
                  Invoices
                </div>
              </div>
            </div>

            {/* Database Statistics */}
            {stats && connectionStatus.canQuery && (
              <div className="space-y-2 pt-2 border-t">
                <h4 className="text-sm font-medium">Database Records:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Organizations: {stats.organizations}</div>
                  <div>Profiles: {stats.profiles}</div>
                  <div>Contacts: {stats.contacts}</div>
                  <div>Invoices: {stats.invoices}</div>
                </div>
              </div>
            )}

            {/* Last Checked */}
            {lastChecked && (
              <div className="text-xs text-gray-500 pt-2 border-t">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Click refresh to check database status
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DatabaseStatus;