# ines-grimaux — guia rápido para agentes

> **AVISO IA:** No inicio de CADA sessao: `python scripts/set_lock_agent.py Cursor` (ou a tua ferramenta). **Nao assumir Antigravity.**
> **Drive obrigatorio:** ver `docs/equipa/PARA-CLONE-SEM-DRIVE.md`

| | |
|---|---|
| **Pasta Drive** | `ines-grimaux` |
| **Domínio** | https://inesgrimaux.com |
| **GitHub** | inesgrimaux/portfolio |
| **Branch** | `master` |

## Identidade (obrigatório)

```powershell
python "G:\Meu Drive\1. WEBSITES\scripts\set_lock_agent.py" Cursor ines-grimaux
python "G:\Meu Drive\1. WEBSITES\scripts\set_lock_agent.py" --show
```

| Ferramenta | Nome |
|---|---|
| Cursor | `Cursor` |
| Claude Code | `Claude-Code` |
| Antigravity | `Antigravity` |

## Fluxo de trabalho

```powershell
cd "G:\Meu Drive\1. WEBSITES"
python scripts\lock_manager.py acquire-auto ines-grimaux "descrição"
cd ines-grimaux\codigo
git add -A && git commit -m "mensagem" && git push origin master
python "G:\Meu Drive\1. WEBSITES\scripts\lock_manager.py" release ines-grimaux
```

## Documentação completa

| Ficheiro | Local |
|---|---|
| Manual operativo | `docs/equipa/INSTRUCOES.md` |
| Setup editores | `docs/equipa/SETUP-EDITORES.md` |
| Drive | `G:\Meu Drive\1. WEBSITES\INSTRUCOES.md` |
