import { TOPICS } from "@/constants/topics";
import QuizCard from "./QuizCard";
import { motion, PanInfo } from "framer-motion";
import { useRef, useEffect, useState, useCallback } from "react";

export default function TopicPicker() {
    const ref = useRef<HTMLDivElement>(null);
    const [constraints, setConstraints] = useState({ left: 0, right: 0 });
    const [showLeftShadow, setShowLeftShadow] = useState(false);
    const [showRightShadow, setShowRightShadow] = useState(true);
    const [dragOffset, setDragOffset] = useState(0);

    useEffect(() => {
        if (ref.current) {
            const totalWidth = ref.current.scrollWidth;
            const visibleWidth = ref.current.offsetWidth;
            setConstraints({
                left: -(totalWidth - visibleWidth),
                right: 0,
            });
            setShowRightShadow(totalWidth > visibleWidth);
        }
    }, []);

    const handleDrag = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (ref.current) {
            const totalWidth = ref.current.scrollWidth;
            const visibleWidth = ref.current.offsetWidth;
            const dragX = info.offset.x;

            setShowLeftShadow(dragX < 0);
            setShowRightShadow(dragX > -(totalWidth - visibleWidth));
            setDragOffset(dragX);
        }
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (ref.current) {
            const scrollAmount = 100;
            if (e.key === "ArrowLeft") {
                ref.current.scrollLeft -= scrollAmount;
            } else if (e.key === "ArrowRight") {
                ref.current.scrollLeft += scrollAmount;
            }
        }
    }, []);

    return (
        <div className="relative w-[80%] mx-auto overflow-hidden p-4">
            {showLeftShadow && (
                <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-[#E5D8CF] to-transparent pointer-events-none z-10"></div>
            )}
            {showRightShadow && (
                <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#E5D8CF] to-transparent pointer-events-none z-10"></div>
            )}
            <motion.div
                ref={ref}
                className="flex flex-row gap-3 items-center flex-nowrap"
                drag="x"
                dragConstraints={constraints}
                dragElastic={0.2}
                onDrag={handleDrag}
                style={{ cursor: "grab" }}
                tabIndex={0}
                onKeyDown={handleKeyDown}
            >
                {TOPICS.map((topic, index) => (
                    <div key={index}>
                        <QuizCard
                            topic={topic.topic}
                            title={topic.title}
                            description={topic.description}
                            color={topic.color}
                            dragOffset={dragOffset}
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
