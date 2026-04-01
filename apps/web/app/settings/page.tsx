"use client";
import { useState, useEffect } from "react";
import { useServerStore } from "@/stores/server-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Modal } from "@/components/common/modal";
import { Loading } from "@/components/common/loading";
import { Trash2, Plus, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { servers, loading, fetchServers, addServer, removeServer, authenticateServer } = useServerStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState("");
  const [serverUrl, setServerUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchServers();
  }, []);

  async function handleAddServer(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAdding(true);
    try {
      await addServer({ name, serverUrl, username, password });
      setShowAddModal(false);
      setName("");
      setServerUrl("");
      setUsername("");
      setPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add server");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">IPTV Servers</h2>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus size={16} className="mr-1 inline" /> Add Server
          </Button>
        </div>

        {loading ? (
          <Loading className="py-8" />
        ) : servers.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No servers added yet.</p>
        ) : (
          <div className="space-y-3">
            {servers.map((server) => (
              <div key={server.id} className="bg-surface-light rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{server.name}</p>
                  <p className="text-sm text-gray-400">{server.serverUrl}</p>
                  <p className="text-xs mt-1">
                    Status:{" "}
                    <span className={server.status === "active" ? "text-green-400" : "text-yellow-400"}>
                      {server.status}
                    </span>
                    {server.expiresAt && <span className="text-gray-500 ml-2">Expires: {server.expiresAt}</span>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => authenticateServer(server.id)} title="Refresh status">
                    <RefreshCw size={16} />
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeServer(server.id)} title="Remove">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add IPTV Server">
        <form onSubmit={handleAddServer} className="space-y-3">
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My Server" required />
          <Input label="Server URL" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} placeholder="http://example.com:8080" required />
          <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={adding}>
              {adding ? "Adding..." : "Add Server"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
