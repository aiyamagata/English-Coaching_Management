import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Plus, Edit, Trash2, Calendar, CheckSquare, FileText, Settings } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { StudentTimeline } from "@/components/StudentTimeline";
import { format, startOfWeek, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

// 日付を「〇〇年〇〇月〇〇日」形式に変換するヘルパー
function formatDateJP(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const str = String(dateStr);
  const match = str.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}年${parseInt(match[2])}月${parseInt(match[3])}日`;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return str;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function StudentHome() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const studentId = params.id ? parseInt(params.id) : 0;

  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isWeeklyMemoDialogOpen, setIsWeeklyMemoDialogOpen] = useState(false);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);

  const { data: student, isLoading: studentLoading } = trpc.students.get.useQuery({ id: studentId });
  const { data: progress, refetch: refetchProgress } = trpc.studentProgress.get.useQuery({ studentId });
  const { data: sessions, refetch: refetchSessions } = trpc.sessions.listByStudent.useQuery({ studentId });
  const { data: actions, refetch: refetchActions } = trpc.actions.listByStudent.useQuery({ studentId });
  const { data: weeklyMemos, refetch: refetchWeeklyMemos } = trpc.weeklyMemos.listByStudent.useQuery({ studentId });
  const { data: plans } = trpc.learningPlans.list.useQuery();
  const { data: steps } = trpc.learningSteps.listByPlan.useQuery(
    { planId: progress?.planId! },
    { enabled: !!progress?.planId }
  );

  const createSessionMutation = trpc.sessions.create.useMutation({
    onSuccess: () => {
      toast.success("セッションを記録しました");
      refetchSessions();
      setIsSessionDialogOpen(false);
    },
  });

  const deleteSessionMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      toast.success("セッションを削除しました");
      refetchSessions();
    },
  });

  const createActionMutation = trpc.actions.create.useMutation({
    onSuccess: () => {
      toast.success("アクションを追加しました");
      refetchActions();
      setIsActionDialogOpen(false);
    },
  });

  const toggleActionMutation = trpc.actions.toggleComplete.useMutation({
    onSuccess: () => {
      refetchActions();
    },
  });

  const deleteActionMutation = trpc.actions.delete.useMutation({
    onSuccess: () => {
      toast.success("アクションを削除しました");
      refetchActions();
    },
  });

  const createWeeklyMemoMutation = trpc.weeklyMemos.create.useMutation({
    onSuccess: () => {
      toast.success("週次メモを保存しました");
      refetchWeeklyMemos();
      setIsWeeklyMemoDialogOpen(false);
    },
  });

  const upsertProgressMutation = trpc.studentProgress.upsert.useMutation({
    onSuccess: () => {
      toast.success("学習プラン進捗を更新しました");
      refetchProgress();
      setIsProgressDialogOpen(false);
    },
  });

  const handleCreateSession = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createSessionMutation.mutate({
      studentId,
      sessionDate: formData.get("sessionDate") as string,
      theme: formData.get("theme") as string || undefined,
      memo: formData.get("memo") as string || undefined,
    });
  };

  const handleCreateAction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createActionMutation.mutate({
      studentId,
      content: formData.get("content") as string,
    });
  };

  const handleCreateWeeklyMemo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const weekStart = startOfWeek(new Date(), { locale: ja });
    createWeeklyMemoMutation.mutate({
      studentId,
      weekStartDate: format(weekStart, "yyyy-MM-dd"),
      memo: formData.get("memo") as string || undefined,
    });
  };

  const handleUpdateProgress = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    upsertProgressMutation.mutate({
      id: progress?.id,
      studentId,
      planId: parseInt(formData.get("planId") as string),
      currentStepId: formData.get("currentStepId") ? parseInt(formData.get("currentStepId") as string) : undefined,
      status: formData.get("status") as "on_track" | "behind" | "ahead",
      nextActionTitle: formData.get("nextActionTitle") as string || undefined,
      nextActionDeadline: formData.get("nextActionDeadline") as string || undefined,
    });
  };

  if (studentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">受講生が見つかりません</p>
            <Button onClick={() => setLocation("/")}>受講生一覧に戻る</Button>
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
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              受講生一覧に戻る
            </Button>
            <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  学習プラン設定
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>学習プラン進捗設定</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateProgress} className="space-y-4">
                  <div>
                    <Label htmlFor="planId">学習プラン *</Label>
                    <Select name="planId" defaultValue={progress?.planId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="プランを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans?.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id.toString()}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currentStepId">現在のステップ</Label>
                    <Select name="currentStepId" defaultValue={progress?.currentStepId?.toString()}>
                      <SelectTrigger>
                        <SelectValue placeholder="ステップを選択" />
                      </SelectTrigger>
                      <SelectContent>
                        {steps?.map((step) => (
                          <SelectItem key={step.id} value={step.id.toString()}>
                            {step.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">進捗状況 *</Label>
                    <Select name="status" defaultValue={progress?.status || "on_track"}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on_track">予定通り</SelectItem>
                        <SelectItem value="behind">遅れ気味</SelectItem>
                        <SelectItem value="ahead">先行気味</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="nextActionTitle">次にすべきこと</Label>
                    <Input id="nextActionTitle" name="nextActionTitle" defaultValue={progress?.nextActionTitle || ""} />
                  </div>
                  <div>
                    <Label htmlFor="nextActionDeadline">期限</Label>
                    <Input id="nextActionDeadline" name="nextActionDeadline" type="date" defaultValue={progress?.nextActionDeadline ? String(progress.nextActionDeadline) : ""} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsProgressDialogOpen(false)}>
                      キャンセル
                    </Button>
                    <Button type="submit" disabled={upsertProgressMutation.isPending}>
                      {upsertProgressMutation.isPending ? "保存中..." : "保存"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-6">
        {/* 基本情報 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{student.name}さん</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex gap-2">
                <span className="text-muted-foreground">開始日:</span>
                <span>{formatDateJP(String(student.startDate))}</span>
              </div>
              {student.endDate && (
                <div className="flex gap-2">
                  <span className="text-muted-foreground">終了予定日:</span>
                  <span>{formatDateJP(String(student.endDate))}</span>
                </div>
              )}
              {(student as any).supportDeadline && (
                <div className="flex gap-2">
                  <span className="text-blue-600 font-medium">サポート期限:</span>
                  <span className="text-blue-600">{formatDateJP(String((student as any).supportDeadline))}</span>
                </div>
              )}
              {(student as any).guaranteeDeadline && (
                <div className="flex gap-2">
                  <span className="text-purple-600 font-medium">保証期限:</span>
                  <span className="text-purple-600">{formatDateJP(String((student as any).guaranteeDeadline))}</span>
                </div>
              )}
              {student.memo && (
                <div className="mt-2">
                  <span className="text-muted-foreground">メモ:</span>
                  <p className="mt-1 whitespace-pre-wrap">{student.memo}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ガントチャート風タイムライン */}
        <StudentTimeline
          student={student}
          progress={progress || undefined}
          steps={steps}
          currentStepId={progress?.currentStepId}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          {/* セッション記録 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  セッション記録
                </CardTitle>
                <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>セッションを記録</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateSession} className="space-y-4">
                      <div>
                        <Label htmlFor="sessionDate">日付 *</Label>
                        <Input id="sessionDate" name="sessionDate" type="date" required defaultValue={format(new Date(), "yyyy-MM-dd")} />
                      </div>
                      <div>
                        <Label htmlFor="theme">テーマ</Label>
                        <Input id="theme" name="theme" />
                      </div>
                      <div>
                        <Label htmlFor="memo">メモ</Label>
                        <Textarea id="memo" name="memo" rows={4} />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button type="submit" disabled={createSessionMutation.isPending}>
                          {createSessionMutation.isPending ? "保存中..." : "保存"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {sessions && sessions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {sessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold">{formatDateJP(String(session.sessionDate))}</div>
                          {session.theme && <div className="text-sm text-muted-foreground">{session.theme}</div>}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSessionMutation.mutate({ id: session.id })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {session.memo && <p className="text-sm whitespace-pre-wrap">{session.memo}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">まだセッション記録がありません</p>
              )}
            </CardContent>
          </Card>

          {/* アクション */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  アクション
                </CardTitle>
                <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>アクションを追加</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateAction} className="space-y-4">
                      <div>
                        <Label htmlFor="content">内容 *</Label>
                        <Textarea id="content" name="content" rows={3} required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button type="submit" disabled={createActionMutation.isPending}>
                          {createActionMutation.isPending ? "追加中..." : "追加"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {actions && actions.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {actions.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 border rounded-lg p-3">
                      <Checkbox
                        checked={action.completed === 1}
                        onCheckedChange={(checked) => {
                          toggleActionMutation.mutate({ id: action.id, completed: checked as boolean });
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${action.completed === 1 ? "line-through text-muted-foreground" : ""}`}>
                          {action.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteActionMutation.mutate({ id: action.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">まだアクションがありません</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 週次メモ */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                週次メモ
              </CardTitle>
              <Dialog open={isWeeklyMemoDialogOpen} onOpenChange={setIsWeeklyMemoDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    今週のメモを追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>週次メモを追加</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWeeklyMemo} className="space-y-4">
                    <div>
                      <Label htmlFor="weekly-memo">メモ</Label>
                      <Textarea id="weekly-memo" name="memo" rows={6} placeholder="今週の様子、来週のプランなど" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsWeeklyMemoDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button type="submit" disabled={createWeeklyMemoMutation.isPending}>
                        {createWeeklyMemoMutation.isPending ? "保存中..." : "保存"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyMemos && weeklyMemos.length > 0 ? (
              <div className="space-y-4">
                {weeklyMemos.map((memo) => (
                  <div key={memo.id} className="border rounded-lg p-4">
                    <div className="text-sm font-semibold mb-2">
                      {format(parseISO(String(memo.weekStartDate)), "yyyy年M月d日週", { locale: ja })}
                    </div>
                    {memo.memo && <p className="text-sm whitespace-pre-wrap">{memo.memo}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">まだ週次メモがありません</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
