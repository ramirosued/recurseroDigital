import express, { Application, Request, Response } from "express";
import cors from "cors";
import loginRoutes from '../delivery/routes/loginRoutes';
import logoutRoutes from '../delivery/routes/logoutRoutes';
import studentRoutes from '../delivery/routes/studentRoutes';
import statisticsRoutes from '../delivery/routes/statisticsRoutes';
import courseRoutes from '../delivery/routes/courseRoutes';
import teacherRoutes from "../delivery/routes/teacherRoutes";
import gameRoutes from "../delivery/routes/gameRoutes";

const app: Application = express();

app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin || true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use("/api/login", loginRoutes);
app.use("/api/logout", logoutRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/games", gameRoutes);

app.use((err: any, req: Request, res: Response, next: Function) => {
    console.error("ERROR EN ROUTE:", err.stack); // imprime el error completo
    res.status(500).json({ error: err.message || "Error interno del servidor" });
});
app.get("/", (req: Request, res: Response) => {
    res.send("Servidor Express funcionando correctamente");
});

export default app;
