import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, FileText } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Knowledge() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<any>(null);
  const [viewingKnowledge, setViewingKnowledge] = useState<any>(null);

  const { data: knowledgeList, refetch } = trpc.knowledge.list.useQuery();

  const createMutation = trpc.knowledge.create.useMutation({
    onSuccess: () => {
      toast.success("ナレッジを追加しました");
      refetch();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error("追加に失敗しました: " + error.message);
    },
  });

  const updateMutation = trpc.knowledge.update.useMutation({
    onSuccess: () => {
      toast.success("ナレッジを更新しました");
      refetch();
      setIsEditDialogOpen(false);
      setEditingKnowledge(null);
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deleteMutation = trpc.knowledge.delete.useMutation({
    onSuccess: () => {
      toast.success("ナレッジを削除しました");
      refetch();
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingKnowledge.id,
      title: formData.get("title") as string,
      content: formData.get("content") as string,
    });
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`「${title}」を削除しますか？`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            受講生一覧に戻る
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">ナレッジ管理</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規追加
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>ナレッジを追加</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="content">内容 *</Label>
                  <Textarea id="content" name="content" rows={10} required />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "追加中..." : "追加"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {knowledgeList && knowledgeList.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {knowledgeList.map((knowledge) => (
              <Card key={knowledge.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="flex items-start gap-2 mb-2">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <h3 className="font-semibold flex-1">{knowledge.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                      {knowledge.content}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewingKnowledge(knowledge)}
                    >
                      詳細
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingKnowledge(knowledge);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(knowledge.id, knowledge.title)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">まだナレッジが登録されていません</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初のナレッジを追加
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ナレッジを編集</DialogTitle>
          </DialogHeader>
          {editingKnowledge && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">タイトル *</Label>
                <Input id="edit-title" name="title" defaultValue={editingKnowledge.title} required />
              </div>
              <div>
                <Label htmlFor="edit-content">内容 *</Label>
                <Textarea id="edit-content" name="content" rows={10} defaultValue={editingKnowledge.content} required />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingKnowledge(null);
                }}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "更新中..." : "更新"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 詳細表示ダイアログ */}
      <Dialog open={!!viewingKnowledge} onOpenChange={(open) => !open && setViewingKnowledge(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewingKnowledge?.title}</DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <p className="whitespace-pre-wrap text-sm">{viewingKnowledge?.content}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewingKnowledge(null)}>
              閉じる
            </Button>
            <Button onClick={() => {
              setEditingKnowledge(viewingKnowledge);
              setViewingKnowledge(null);
              setIsEditDialogOpen(true);
            }}>
              編集
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
