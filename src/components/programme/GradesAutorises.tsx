export const GRADES = ["Explorateur", "Constructeur", "Navigateur", "Alchimiste"];

export default function GradesAutorises({ grades, onChange }: {
  grades: string[];
  onChange: (grades: string[]) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-gray-700">Grades autorisés à s’inscrire</legend>
      <div className="flex flex-wrap gap-3">
        {GRADES.map((grade) => (
          <label key={grade} className="flex items-center gap-1.5 text-sm">
            <input type="checkbox" checked={grade === "Alchimiste" || grades.includes(grade)}
              disabled={grade === "Alchimiste"}
              onChange={(event) => onChange(GRADES.filter((item) =>
                item === "Alchimiste" || (item === grade ? event.target.checked : grades.includes(item))
              ))} />
            {grade}
          </label>
        ))}
      </div>
      <p className="mt-1 text-xs text-gray-500">Les Alchimistes ont accès à toutes les séances.</p>
    </fieldset>
  );
}
