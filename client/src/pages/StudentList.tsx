import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Users, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function StudentList() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const { data: students, isLoading, refetch } = trpc.students.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createMutation = trpc.students.create.useMutation({
    onSuccess: () => {
      toast.success("受講生を追加しました");
      refetch();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error("追加に失敗しました: " + error.message);
    },
  });

  const updateMutation = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("受講生情報を更新しました");
      refetch();
      setIsEditDialogOpen(false);
      setEditingStudent(null);
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deleteMutation = trpc.students.delete.useMutation({
    onSuccess: () => {
      toast.success("受講生を削除しました");
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
      name: formData.get("name") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || undefined,
      memo: formData.get("memo") as string || undefined,
    });
  };

  const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingStudent.id,
      name: formData.get("name") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || undefined,
      memo: formData.get("memo") as string || undefined,
    });
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`${name}さんを削除しますか？関連するセッション・アクション・週次メモも全て削除されます。`)) {
      deleteMutation.mutate({ id });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">英会話コーチング受講生管理システム</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">ログインして受講生を管理しましょう</p>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              ログイン
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">受講生管理システム</h1>
              <p className="text-sm text-muted-foreground mt-1">ようこそ、{user?.name}さん</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setLocation("/plans")}>
                <BookOpen className="h-4 w-4 mr-2" />
                学習プラン管理
              </Button>
              <Button variant="outline" onClick={() => setLocation("/knowledge")}>
                <BookOpen className="h-4 w-4 mr-2" />
                ナレッジ管理
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">受講生一覧</h2>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                新規追加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>受講生を追加</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label htmlFor="name">名前 *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="startDate">開始日 *</Label>
                  <Input id="startDate" name="startDate" type="date" required />
                </div>
                <div>
                  <Label htmlFor="endDate">終了予定日</Label>
                  <Input id="endDate" name="endDate" type="date" />
                </div>
                <div>
                  <Label htmlFor="memo">メモ</Label>
                  <Textarea id="memo" name="memo" rows={3} />
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

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : students && students.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => (
              <Card key={student.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div onClick={() => setLocation(`/students/${student.id}`)} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{student.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>開始: {String(student.startDate)}</span>
                    </div>
                    {student.endDate && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>終了予定: {String(student.endDate)}</span>
                      </div>
                    )}
                    {student.memo && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{student.memo}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingStudent(student);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      編集
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(student.id, student.name);
                      }}
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
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">まだ受講生が登録されていません</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                最初の受講生を追加
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>受講生情報を編集</DialogTitle>
          </DialogHeader>
          {editingStudent && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">名前 *</Label>
                <Input id="edit-name" name="name" defaultValue={editingStudent.name} required />
              </div>
              <div>
                <Label htmlFor="edit-startDate">開始日 *</Label>
                <Input id="edit-startDate" name="startDate" type="date" defaultValue={editingStudent.startDate} required />
              </div>
              <div>
                <Label htmlFor="edit-endDate">終了予定日</Label>
                <Input id="edit-endDate" name="endDate" type="date" defaultValue={editingStudent.endDate || ""} />
              </div>
              <div>
                <Label htmlFor="edit-memo">メモ</Label>
                <Textarea id="edit-memo" name="memo" rows={3} defaultValue={editingStudent.memo || ""} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingStudent(null);
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
    </div>
  );
}
