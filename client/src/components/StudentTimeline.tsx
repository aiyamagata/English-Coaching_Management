import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { format, differenceInDays, parseISO, addDays } from "date-fns";
import { ja } from "date-fns/locale";

interface TimelineProps {
  student: {
    startDate: string | Date;
    endDate: string | Date | null;
  };
  progress?: {
    status: "on_track" | "behind" | "ahead";
    nextActionTitle: string | null;
    nextActionDeadline: string | Date | null;
  } | null;
  steps?: Array<{
    id: number;
    title: string;
    estimatedDays: number | null;
    stepOrder: number;
  }>;
  currentStepId?: number | null;
}

export function StudentTimeline({ student, progress, steps = [], currentStepId }: TimelineProps) {
  const startDate = typeof student.startDate === 'string' ? parseISO(student.startDate) : student.startDate;
  const endDate = student.endDate ? (typeof student.endDate === 'string' ? parseISO(student.endDate) : student.endDate) : addDays(startDate, 180); // デフォルト6ヶ月
  const today = new Date();
  
  const totalDays = differenceInDays(endDate, startDate);
  const elapsedDays = differenceInDays(today, startDate);
  const progressPercentage = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  const statusConfig = {
    on_track: {
      label: "予定通り",
      color: "bg-green-500",
      icon: CheckCircle,
      badgeVariant: "default" as const,
    },
    behind: {
      label: "遅れ気味",
      color: "bg-yellow-500",
      icon: AlertCircle,
      badgeVariant: "secondary" as const,
    },
    ahead: {
      label: "先行気味",
      color: "bg-blue-500",
      icon: Clock,
      badgeVariant: "outline" as const,
    },
  };

  const currentStatus = progress?.status || "on_track";
  const StatusIcon = statusConfig[currentStatus].icon;

  // ステップの位置を計算
  const calculateStepPosition = (stepIndex: number) => {
    if (steps.length === 0) return 0;
    return (stepIndex / steps.length) * 100;
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            学習プランタイムライン
          </CardTitle>
          <Badge variant={statusConfig[currentStatus].badgeVariant} className="flex items-center gap-1">
            <StatusIcon className="h-3 w-3" />
            {statusConfig[currentStatus].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 期間表示 */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-muted-foreground">開始:</span>
            <span className="ml-2 font-semibold">{format(startDate, "yyyy年M月d日", { locale: ja })}</span>
          </div>
          <div>
            <span className="text-muted-foreground">終了予定:</span>
            <span className="ml-2 font-semibold">{format(endDate, "yyyy年M月d日", { locale: ja })}</span>
          </div>
        </div>

        {/* タイムラインバー */}
        <div className="space-y-2">
          <div className="relative h-8 bg-muted rounded-full overflow-hidden">
            {/* 進捗バー */}
            <div
              className={`absolute top-0 left-0 h-full ${statusConfig[currentStatus].color} transition-all duration-500`}
              style={{ width: `${progressPercentage}%` }}
            />
            
            {/* ステップマーカー */}
            {steps.map((step, index) => {
              const position = calculateStepPosition(index);
              const isCurrent = step.id === currentStepId;
              const isPast = currentStepIndex >= 0 && index < currentStepIndex;
              
              return (
                <div
                  key={step.id}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 ${
                      isCurrent
                        ? "bg-primary border-primary-foreground scale-125"
                        : isPast
                        ? "bg-primary/50 border-primary"
                        : "bg-background border-muted-foreground"
                    } transition-all`}
                  />
                </div>
              );
            })}

            {/* 現在位置マーカー */}
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground/30"
              style={{ left: `${progressPercentage}%` }}
            >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-background" />
            </div>
          </div>

          {/* ステップ名表示 */}
          {steps.length > 0 && (
            <div className="relative h-12">
              {steps.map((step, index) => {
                const position = calculateStepPosition(index);
                const isCurrent = step.id === currentStepId;
                
                return (
                  <div
                    key={step.id}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${position}%` }}
                  >
                    <div className={`text-xs text-center max-w-20 ${isCurrent ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                      {step.title}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 進捗情報 */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <div className="text-xs text-muted-foreground mb-1">経過日数</div>
            <div className="text-lg font-semibold">
              {elapsedDays}日 / {totalDays}日
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">進捗率</div>
            <div className="text-lg font-semibold">{Math.round(progressPercentage)}%</div>
          </div>
        </div>

        {/* 次のアクション */}
        {progress?.nextActionTitle && (
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm mb-1">次にすべきこと</div>
                <div className="text-sm mb-2">{progress.nextActionTitle}</div>
                {progress.nextActionDeadline && (
                  <div className="text-xs text-muted-foreground">
                    期限: {format(typeof progress.nextActionDeadline === 'string' ? parseISO(progress.nextActionDeadline) : progress.nextActionDeadline, "yyyy年M月d日", { locale: ja })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
