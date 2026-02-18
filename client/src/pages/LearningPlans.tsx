import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, List } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function LearningPlans() {
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [editingStep, setEditingStep] = useState<any>(null);

  const { data: plans, refetch: refetchPlans } = trpc.learningPlans.list.useQuery();
  const { data: steps, refetch: refetchSteps } = trpc.learningSteps.listByPlan.useQuery(
    { planId: selectedPlanId! },
    { enabled: !!selectedPlanId }
  );

  const createPlanMutation = trpc.learningPlans.create.useMutation({
    onSuccess: () => {
      toast.success("学習プランを追加しました");
      refetchPlans();
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error("追加に失敗しました: " + error.message);
    },
  });

  const updatePlanMutation = trpc.learningPlans.update.useMutation({
    onSuccess: () => {
      toast.success("学習プランを更新しました");
      refetchPlans();
      setIsEditDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deletePlanMutation = trpc.learningPlans.delete.useMutation({
    onSuccess: () => {
      toast.success("学習プランを削除しました");
      refetchPlans();
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  const createStepMutation = trpc.learningSteps.create.useMutation({
    onSuccess: () => {
      toast.success("ステップを追加しました");
      refetchSteps();
      setIsStepDialogOpen(false);
    },
    onError: (error) => {
      toast.error("追加に失敗しました: " + error.message);
    },
  });

  const updateStepMutation = trpc.learningSteps.update.useMutation({
    onSuccess: () => {
      toast.success("ステップを更新しました");
      refetchSteps();
      setIsStepDialogOpen(false);
      setEditingStep(null);
    },
    onError: (error) => {
      toast.error("更新に失敗しました: " + error.message);
    },
  });

  const deleteStepMutation = trpc.learningSteps.delete.useMutation({
    onSuccess: () => {
      toast.success("ステップを削除しました");
      refetchSteps();
    },
    onError: (error) => {
      toast.error("削除に失敗しました: " + error.message);
    },
  });

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createPlanMutation.mutate({
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
    });
  };

  const handleEditPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updatePlanMutation.mutate({
      id: editingPlan.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string || undefined,
    });
  };

  const handleDeletePlan = (id: number, name: string) => {
    if (confirm(`「${name}」を削除しますか？`)) {
      deletePlanMutation.mutate({ id });
    }
  };

  const handleCreateStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nextOrder = steps ? steps.length + 1 : 1;
    createStepMutation.mutate({
      planId: selectedPlanId!,
      stepOrder: nextOrder,
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      estimatedDays: formData.get("estimatedDays") ? parseInt(formData.get("estimatedDays") as string) : undefined,
    });
  };

  const handleEditStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateStepMutation.mutate({
      id: editingStep.id,
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      estimatedDays: formData.get("estimatedDays") ? parseInt(formData.get("estimatedDays") as string) : undefined,
    });
  };

  const handleDeleteStep = (id: number, title: string) => {
    if (confirm(`「${title}」を削除しますか？`)) {
      deleteStepMutation.mutate({ id });
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
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 学習プラン一覧 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">学習プラン</h2>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    新規追加
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>学習プランを追加</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreatePlan} className="space-y-4">
                    <div>
                      <Label htmlFor="name">プラン名 *</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="description">説明</Label>
                      <Textarea id="description" name="description" rows={3} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        キャンセル
                      </Button>
                      <Button type="submit" disabled={createPlanMutation.isPending}>
                        {createPlanMutation.isPending ? "追加中..." : "追加"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {plans && plans.length > 0 ? (
                plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      selectedPlanId === plan.id ? "ring-2 ring-primary" : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedPlanId(plan.id)}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{plan.name}</h3>
                          {plan.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{plan.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingPlan(plan);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id, plan.name);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">学習プランがまだありません</p>
                    <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      最初のプランを追加
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* 学習ステップ一覧 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">学習ステップ</h2>
              </div>
              {selectedPlanId && (
                <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      ステップ追加
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ステップを追加</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateStep} className="space-y-4">
                      <div>
                        <Label htmlFor="step-title">タイトル *</Label>
                        <Input id="step-title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="step-description">説明</Label>
                        <Textarea id="step-description" name="description" rows={3} />
                      </div>
                      <div>
                        <Label htmlFor="step-estimatedDays">想定日数</Label>
                        <Input id="step-estimatedDays" name="estimatedDays" type="number" min="1" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsStepDialogOpen(false)}>
                          キャンセル
                        </Button>
                        <Button type="submit" disabled={createStepMutation.isPending}>
                          {createStepMutation.isPending ? "追加中..." : "追加"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {selectedPlanId ? (
              <div className="space-y-3">
                {steps && steps.length > 0 ? (
                  steps.map((step, index) => (
                    <Card key={step.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold mb-1">{step.title}</h3>
                            {step.description && (
                              <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                            )}
                            {step.estimatedDays && (
                              <p className="text-xs text-muted-foreground">想定期間: {step.estimatedDays}日</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingStep(step);
                                setIsStepDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteStep(step.id, step.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">このプランにはまだステップがありません</p>
                      <Button size="sm" onClick={() => setIsStepDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        最初のステップを追加
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <List className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">左側から学習プランを選択してください</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      {/* プラン編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>学習プランを編集</DialogTitle>
          </DialogHeader>
          {editingPlan && (
            <form onSubmit={handleEditPlan} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">プラン名 *</Label>
                <Input id="edit-name" name="name" defaultValue={editingPlan.name} required />
              </div>
              <div>
                <Label htmlFor="edit-description">説明</Label>
                <Textarea id="edit-description" name="description" rows={3} defaultValue={editingPlan.description || ""} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingPlan(null);
                }}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={updatePlanMutation.isPending}>
                  {updatePlanMutation.isPending ? "更新中..." : "更新"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ステップ編集ダイアログ */}
      {editingStep && (
        <Dialog open={isStepDialogOpen && !!editingStep} onOpenChange={(open) => {
          if (!open) {
            setEditingStep(null);
          }
          setIsStepDialogOpen(open);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ステップを編集</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditStep} className="space-y-4">
              <div>
                <Label htmlFor="edit-step-title">タイトル *</Label>
                <Input id="edit-step-title" name="title" defaultValue={editingStep.title} required />
              </div>
              <div>
                <Label htmlFor="edit-step-description">説明</Label>
                <Textarea id="edit-step-description" name="description" rows={3} defaultValue={editingStep.description || ""} />
              </div>
              <div>
                <Label htmlFor="edit-step-estimatedDays">想定日数</Label>
                <Input id="edit-step-estimatedDays" name="estimatedDays" type="number" min="1" defaultValue={editingStep.estimatedDays || ""} />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsStepDialogOpen(false);
                  setEditingStep(null);
                }}>
                  キャンセル
                </Button>
                <Button type="submit" disabled={updateStepMutation.isPending}>
                  {updateStepMutation.isPending ? "更新中..." : "更新"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
