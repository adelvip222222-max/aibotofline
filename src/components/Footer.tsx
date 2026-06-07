export default function Footer() {
  return (
    <footer className="bg-gray-900/90 border-t border-gray-800 py-3 px-4">
      <div className="max-w-7xl mx-auto">
        {/* للشاشات الكبيرة */}
        <div className="hidden md:flex items-center justify-between gap-4 text-xs">
          {/* الدعم الفني */}
          <div>
            <p className="font-semibold text-gray-400 text-sm mb-0.5">الدعم الفني</p>
            <p className="text-gray-500">فرع نظم المعلومات - الكلية الجوية</p>
          </div>

          {/* المطورين */}
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="font-semibold text-gray-400 text-sm mb-0.5">المطورين</p>
              <p className="text-gray-500">رائد / أحمد ناجي - رقيب أول / محمود عادل</p>
            </div>

            <div className="w-px h-10 bg-gray-700"></div>

            {/* رئيس الفرع */}
            <div className="text-center">
              <p className="font-semibold text-gray-400 text-sm mb-0.5">رئيس الفرع</p>
              <p className="text-gray-500">مقدم / حسن محمود حنون</p>
            </div>

            <div className="w-px h-10 bg-gray-700"></div>

            {/* الرقم */}
            <div className="text-center px-2">
              <p className="text-lg font-bold text-blue-400">68142</p>
            </div>
          </div>
        </div>

        {/* للشاشات الصغيرة */}
        <div className="md:hidden text-center text-xs text-gray-500 space-y-1.5">
          <p>
            <span className="text-gray-400 font-semibold">الدعم الفني:</span> فرع نظم المعلومات - الكلية الجوية
          </p>
          <p>
            <span className="text-gray-400 font-semibold">المطورين:</span> رائد / أحمد ناجي - رقيب أول / محمود عادل
          </p>
          <p>
            <span className="text-gray-400 font-semibold">رئيس الفرع:</span> مقدم / حسن محمود حنون 
            <span className="text-blue-400 font-bold mr-2">68142</span>
          </p>
        </div>
      </div>
    </footer>
  );
}